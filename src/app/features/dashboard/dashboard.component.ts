import { Component, computed, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../core/http/backend_service/dashboard.service';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { EChartsOption } from 'echarts/types/dist/shared';
import { NgxEchartsDirective } from 'ngx-echarts';
import { DashboardSkeletonComponent } from './components/dashboard-skeleton/dashboard-skeleton.component';
import { RefreshService } from '../../core/services/refresh.service';
import { Project, ProjectsHours } from '../../core/models/reponse/projects-hours.response.model';
import { User } from '../../core/models/reponse/top-performers.response.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [KpiCardComponent, NgxEchartsDirective, DashboardSkeletonComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly refreshService = inject(RefreshService);
  private readonly injector = inject(Injector);
  readonly projectsHours = signal<ProjectsHours | null>(null);
  readonly topPerformers = signal<User[] | null>(null);
  // readonly inactiveUsers = computed(() => {
  //   const data = this.dashboardData();
  //   if (!data) return 0;
  //   return data.dashboardUsers.userKpis.totalUsers - data.dashboardUsers.userKpis.usersWithHours;
  // });
  readonly loading = signal(true);

  ngOnInit(): void {
    effect(
      () => {
        this.refreshService.refreshTick();
        this.loadProjectsHours();
      },
      { injector: this.injector },
    );
  }

  private loadProjectsHours(): void {
    this.loading.set(true);
    this.dashboardService.getProjectsHours().subscribe({
      next: (projects) => {
        this.projectsHours.set(projects);

        this.loadTopPerformers();
      },
      error: () => {
        // TODO: handle error case
        this.loading.set(false);
      },
    });
  }
  private loadTopPerformers(): void {
    this.loading.set(true);
    this.dashboardService.getTopPerformers().subscribe({
      next: (users) => {
        // Assuming you have a signal for top performers
        this.topPerformers.set(users);
        this.loading.set(false);
      },
      error: () => {
        // TODO: handle error case
        this.loading.set(false);
      },
    });
  }

  topContributorsOptions = computed<EChartsOption>(() => {
    const data = this.topPerformers();
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
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const user = data[params[0].dataIndex];
          const displayName = user.displayName
            .replace(/@?(?:tildetech.ae|shuratech.com)/gi, '')
            .trim();
          return `
            <strong>${displayName}</strong><br/>
            ${user.email}<br/>
            Tasks Closed: ${user.closedTasksCount}<br/>
            Total Hours: ${user.totalHours}h
          `;
        },
      },
      legend: { show: false },
      xAxis: { type: 'value' }, // numbers on X
      yAxis: {
        type: 'category',
        data: data.map((user) => user.displayName),
      }, // names on Y
      series: [{ type: 'bar', data: data.map((user) => user.totalHours) }],
    };
  });

  projectsWorkloadOptions = computed<EChartsOption>(() => {
    const data = this.projectsHours();
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
          const project = data.projects.find((p) => p.projectName === name);
          return `{name|${name}}{value|${project?.totalHours.toFixed(2) ?? 0}h}`;
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
        data: data.projects.filter((p) => p.totalHours > 0).map((p) => p.projectName),
      },
      series: [
        {
          type: 'pie',
          data: data.projects
            .filter((p) => p.totalHours > 0)
            .map((project) => {
              return { name: project.projectName, value: Number(project.totalHours.toFixed(2)) };
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
