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
import * as XLSX from 'xlsx';
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
  weekdays = this.dateService.weekdaysCount();

  readonly logComplianceTotalUsers = computed(() => this.azureUsers()?.users.length ?? 0);
  readonly selectedDateRangeLabel = computed(() => {
    const range = this.dateService.selectedDateRange();

    if (!range) {
      return 'All available dates';
    }

    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return `${formatter.format(range.start)} to ${formatter.format(range.end)}`;
  });
  readonly logComplianceSubtitle = computed(
    () =>
      `Distribution of ${this.logComplianceTotalUsers()} employees by logged hours vs. target (${this.dateService.targetHoursCount()}h)`,
  );

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

      if (percentage < 50) {
        counts.lowCompliance += 1;
      } else if (percentage < 100) {
        counts.partialCompliance += 1;
      } else {
        counts.compliant += 1;
      }
    });

    return [
      { name: 'Zero log', value: counts.zeroLog },
      { name: '1-49%', value: counts.lowCompliance },
      { name: '50-100%', value: counts.partialCompliance },
      { name: '100+%', value: counts.compliant },
    ];
  });

  readonly logComplianceOptions = computed<EChartsOption>(() => {
    const data = this.logComplianceChartData();
    const totalUsers = this.logComplianceTotalUsers();

    return {
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

  exportLogComplianceToXlsx(): void {
    const data = this.logComplianceChartData();
    const totalUsers = this.logComplianceTotalUsers();
    const dateRangeLabel = this.selectedDateRangeLabel();

    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Log Compliance Report ' + `(${dateRangeLabel})`],
      [],
      ['Compliance', 'Users', 'Percentage of users'],
      ...data.map((item) => [
        item.name,
        item.value,
        totalUsers ? `${((item.value / totalUsers) * 100).toFixed(1)}%` : '0.0%',
      ]),
      [],
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Log Compliance');
    XLSX.writeFile(workbook, 'Log_Compliance_Report.xlsx');
  }

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

  targetHoursOptions = computed<EChartsOption>(() => {
    const achieved = 3463.3;
    const target = 3927.0;
    const percent = target > 0 ? +((achieved / target) * 100).toFixed(1) : 0;

    return {
      title: {
        text: 'Target achievement',
        left: 'start',
        subtext: 'Logged vs expected hours for the selected range',
        textStyle: {
          fontWeight: 700,
          fontSize: 15,
          color: '#1D1D1B',
        },
        subtextStyle: {
          fontStyle: 'normal',
          color: '#9A9A9A',
          fontSize: 12,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}h ({d}%)',
      },
      series: [
        {
          type: 'gauge',
          renderer: 'svg',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          radius: '78%',
          center: ['50%', '58%'],
          progress: {
            show: true,
            width: 24,
            roundCap: true, // <-- rounded ends, matches the image
            itemStyle: {
              color: '#E8821A', // Sheen Orange
            },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 24,
              color: [[1, '#EFEDE8']], // light muted track
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          anchor: { show: false },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '20%'],
            formatter: () =>
              `{percent|${percent}%}\n{hours|${achieved.toFixed(1)}h / ${target.toFixed(1)}h}`,
            rich: {
              percent: {
                fontSize: 34,
                fontWeight: 700,
                fontFamily: 'DM Mono, monospace',
                color: '#E8821A',
                lineHeight: 38,
              },
              hours: {
                fontSize: 14,
                fontFamily: 'DM Mono, monospace',
                color: '#9A9A9A',
                lineHeight: 20,
                padding: [4, 0, 0, 0],
              },
            },
          },
          data: [{ value: percent }],
        },
      ],
    };
  });
}
