import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../core/http/backend_service/dashboard.service';
import { DashboardResponse } from '../../core/models/reponse/dashboard.response.model';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { EChartsOption } from 'echarts/types/dist/shared';
import { NgxEchartsDirective } from 'ngx-echarts';
import { DashboardSkeletonComponent } from './components/dashboard-skeleton/dashboard-skeleton.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [KpiCardComponent, NgxEchartsDirective, DashboardSkeletonComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly dashboardData = signal<DashboardResponse | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: () => {
        // TODO: handle error case
        this.loading.set(false);
      },
    });
  }

  topContributorsOptions = computed<EChartsOption>(() => {
    const data = this.dashboardData();
    if (!data) return {};
    return {
      title: {
        text: 'Top Contributors',
        left: 'start',
        subtext: 'Based on total hours contributed',
        subtextStyle: {
          fontStyle: 'italic',
          color: '#888888',
        },
        textStyle: {
          fontWeight: 'bold',
        },
      },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Hours'], bottom: 0 },
      xAxis: { type: 'value' }, // numbers on X
      yAxis: {
        type: 'category',
        data: data.dashboardUsers.topUsers.map((user) => user.displayName),
      }, // names on Y
      series: [{ type: 'bar', data: data.dashboardUsers.topUsers.map((user) => user.totalHours) }],
    };
  });

  projectsWorkloadOptions = computed<EChartsOption>(() => {
    const data = this.dashboardData();
    if (!data) return {};
    return {
      title: {
        text: 'Workload by project',
        left: 'start',
        subtext: 'Hours distribution',
        textStyle: {
          fontWeight: 'bold',
        },
        subtextStyle: {
          fontStyle: 'italic',
          color: '#888888',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}h ({d}%)',
      },
      legend: {
        orient: 'vertical',
        bottom: '0',
        left: 'center',
        align: 'auto',
        itemGap: 10,

        formatter: (name: string) => {
          const project = data.projectsKpis.find((p) => p.projectName === name);
          return `{name|${name}}{value|${project?.totalHours ?? 0}h}`;
        },
        textStyle: {
          rich: {
            name: {
              fontSize: 14,
              width: 160,
              color: '#333',
            },
            value: {
              fontSize: 14,
              width: 70,
              align: 'right',
              color: '#888888',
            },
          },
        },
        data: data.projectsKpis.map((p) => p.projectName),
      },
      series: [
        {
          type: 'pie',
          data: data.projectsKpis.map((project) => {
            return { name: project.projectName, value: project.totalHours };
          }),
          avoidLabelOverlap: true,
          center: ['50%', '40%'],
          radius: [60, 110],
          label: { show: false },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
          },
        },
      ],
    };
  });
}
