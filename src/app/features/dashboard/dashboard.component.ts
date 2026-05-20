import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../core/http/backend_service/dashboard.service';
import { DashboardResponse } from '../../core/models/reponse/dashboard.response.model';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { EChartsOption } from 'echarts/types/dist/shared';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
  selector: 'app-dashboard',
  imports: [KpiCardComponent, NgxEchartsDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly dashboardData = signal<DashboardResponse>({} as DashboardResponse);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  topContributorsOptions = computed<EChartsOption>(() => ({
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
      data: this.dashboardData().topUsers.map((user) => user.displayName),
    }, // names on Y
    series: [{ type: 'bar', data: this.dashboardData().topUsers.map((user) => user.totalHours) }],
  }));

  projectsWorkloadOptions = computed<EChartsOption>(() => ({
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
        const project = this.dashboardData().projectsKpis.projects.find(
          (p) => p.projectName === name,
        );
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
      data: this.dashboardData().projectsKpis.projects.map((p) => p.projectName),
    },
    series: [
      {
        type: 'pie',
        data: this.dashboardData().projectsKpis.projects.map((project) => {
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
  }));

  loadDashboardData() {
    this.dashboardService.getDashboardData().subscribe((data) => {
      this.dashboardData.set(data);
    });
  }
}
