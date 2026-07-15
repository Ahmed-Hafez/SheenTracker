import { Component, computed, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../core/http/backend_service/dashboard.service';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { EChartsOption } from 'echarts/types/dist/shared';
import { NgxEchartsDirective } from 'ngx-echarts';
import { DashboardSkeletonComponent } from './components/dashboard-skeleton/dashboard-skeleton.component';
import { RefreshService } from '../../core/services/refresh.service';
import { ProjectsHours } from '../../core/models/reponse/projects-hours.response.model';
import { User } from '../../core/models/reponse/top-performers.response.model';
import { MetaDataService } from '../../core/http/backend_service/meta-data.service';
import { UsersService } from '../../core/http/backend_service/azure-users.service';
import { DateService } from '../../core/services/date.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs';
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
  private readonly metaDataService = inject(MetaDataService);
  private readonly usersService = inject(UsersService);
  private readonly dateService = inject(DateService);
  private readonly injector = inject(Injector);
  readonly projectsHours = signal<ProjectsHours | null>(null);
  readonly topPerformers = signal<User[] | null>(null);
  readonly loading = signal(true);

  azureUsersKpis = this.metaDataService.usersKpis$;
  azureUsers = this.usersService.usersResponse$;

  readonly logComplianceTotalUsers = computed(() => this.azureUsers()?.users.length ?? 0);

  private readonly logComplianceChartData = computed(() => {
    const users = this.azureUsers()?.users ?? [];
    const targetHours = this.dateService.targetHoursCount();
    const safeTargetHours = targetHours > 0 ? targetHours : 1;

    const counts = {
      zeroLog: 0,
      lowCompliance: 0,
      partialCompliance: 0,
      compliant: 0,
    };

    users.forEach((user) => {
      if (user.totalHours <= 0) {
        counts.zeroLog += 1;
        return;
      }

      const percentage = (user.totalHours / safeTargetHours) * 100;

      if (percentage < 3) {
        counts.lowCompliance += 1;
      } else if (percentage < 100) {
        counts.partialCompliance += 1;
      } else {
        counts.compliant += 1;
      }
    });

    return [
      { name: 'Zero log', value: counts.zeroLog },
      { name: '0-3%', value: counts.lowCompliance },
      { name: '3-99%', value: counts.partialCompliance },
      //100 to infinity, because some users may log more than 100% of the target hours
      { name: '100-∞%', value: counts.compliant },
    ];
  });

  readonly logComplianceOptions = computed<EChartsOption>(() => {
    const data = this.logComplianceChartData();
    const totalUsers = this.logComplianceTotalUsers();

    return {
      title: {
        text: 'Log compliance',
        left: 'start',
        subtext: `Distribution of ${totalUsers} employees by logged hours vs. target (${this.dateService.targetHoursCount()}h)`,
        textStyle: {
          fontWeight: 'bold',
        },
        subtextStyle: {
          fontStyle: 'italic',
          color: '#888888',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params?.[0];
          const count = Number(item?.value ?? 0);
          const percentage = totalUsers ? ((count / totalUsers) * 100).toFixed(1) : '0.0';
          return `${item?.axisValue}<br/>Users: ${count}<br/>Percentage: ${percentage}%`;
        },
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '6%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        name: 'Compliance grouped by percentage',
        nameLocation: 'middle',
        nameGap: 30,
        data: data.map((item) => item.name),
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        name: '# of Users',
        nameLocation: 'middle',
        nameGap: 40,
      },
      series: [
        {
          type: 'bar',
          data: data.map((item) => item.value),
          barWidth: '70%',
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: ({ dataIndex }) => ['#b13a3a', '#d08a1f', '#1f66b3', '#20a57a'][dataIndex],
          },
          label: {
            show: true,
            position: 'top',
            formatter: ({ value }) => {
              const numericValue = Number(value);
              return totalUsers ? `${((numericValue / totalUsers) * 100).toFixed(1)}%` : '0%';
            },
            fontWeight: 600,
          },
        },
      ],
    };
  });

  ngOnInit(): void {
    effect(
      () => {
        this.refreshService.refreshTick();
        this.loadDashboardData();
      },
      { injector: this.injector },
    );
  }

  private loadDashboardData(): void {
    this.loading.set(true);

    forkJoin({
      azureUsers: this.usersService.getAzureUsers(),
      projectsHours: this.dashboardService.getProjectsHours(),
      topPerformers: this.dashboardService.getTopPerformers(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ projectsHours, topPerformers }) => {
          this.projectsHours.set(projectsHours);
          this.topPerformers.set(topPerformers);
        },
        error: () => {
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
        subtext: 'Based on total closed tasks',
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
      xAxis: { type: 'value', name: 'Closed Tasks', nameLocation: 'middle', nameGap: 30 }, // numbers on X
      yAxis: {
        type: 'category',
        data: data.map((user) => user.displayName),
      }, // names on Y
      series: [{ type: 'bar', data: data.map((user) => user.closedTasksCount) }],
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
          return `{name|${name}}{value|${Math.ceil(project?.totalHours || 0) ?? 0}h}`;
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
