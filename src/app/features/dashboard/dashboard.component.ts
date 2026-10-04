import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
  WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { complianceBucketQuery } from './compliance-bucket-query';
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
import { catchError, finalize, forkJoin, of, OperatorFunction, tap } from 'rxjs';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    KpiCardComponent,
    NgxEchartsDirective,
    DashboardSkeletonComponent,
    NgTemplateOutlet,
    RouterLink,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly refreshService = inject(RefreshService);
  private readonly metaDataService = inject(MetaDataService);
  private readonly usersService = inject(UsersService);
  private readonly dateService = inject(DateService);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  readonly projectsHours = signal<ProjectsHours | null>(null);
  readonly topPerformers = signal<User[] | null>(null);
  readonly loading = signal(true);
  readonly usersFailed = signal(false);
  readonly projectsFailed = signal(false);
  readonly performersFailed = signal(false);
  readonly hasProjectHours = computed(() =>
    (this.projectsHours()?.projects ?? []).some((project) => project.totalHours > 0),
  );

  azureUsersKpis = this.metaDataService.usersKpis$;
  azureUsers = this.usersService.usersResponse$;
  weekdays = this.dateService.weekdaysCount();

  chartData = computed(() => this.dashboardService.getTargetAchievmentChartData());

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

  private readonly userCompliance = computed(() => {
    const workingDays = this.dateService.weekdaysCount() - this.dateService.holidaysCount();
    return (this.azureUsers()?.users ?? []).map((user) => {
      const expectedHoursPerDay = user.expectedHours !== null ? user.expectedHours : 6.5;
      const expectedHours = expectedHoursPerDay * workingDays;
      const percentage = user.totalHours <= 0 ? 0 : (user.totalHours / expectedHours) * 100;
      return { user, expectedHours, percentage };
    });
  });

  /** Users under 80% of expected hours, lowest first, so the people to follow up are named. */
  readonly belowTarget = computed(() =>
    this.userCompliance()
      .filter(({ percentage }) => percentage < 80)
      .sort(
        (a, b) =>
          a.percentage - b.percentage || a.user.displayName.localeCompare(b.user.displayName),
      ),
  );
  readonly followUpRows = computed(() =>
    this.belowTarget()
      .slice(0, 8)
      .map(({ user, expectedHours, percentage }) => ({
        userKey: user.userKey,
        name: user.displayName.replace(/@?(?:tildetech.ae|shuratech.com)/gi, '').trim(),
        hours: user.totalHours.toFixed(1),
        expectedHours: expectedHours.toFixed(0),
        percentage: Math.round(percentage),
      })),
  );

  readonly totalExpectedHours = computed(() => Math.round(this.chartData().targetHours));
  readonly inactiveShare = computed(() => {
    const { inActiveUsers, totalUsers } = this.azureUsersKpis();
    return totalUsers
      ? `${Math.round((inActiveUsers / totalUsers) * 100)}% of ${totalUsers} users`
      : null;
  });

  private readonly logComplianceChartData = computed(() => {
    const counts = {
      zeroLog: 0,
      lowCompliance: 0,
      partialCompliance: 0,
      nearCompliance: 0,
      overCompliance: 0,
    };

    this.userCompliance().forEach(({ user, percentage }) => {
      if (user.totalHours <= 0) {
        counts.zeroLog += 1;
        return;
      }

      if (percentage <= 50) {
        counts.lowCompliance += 1;
      } else if (percentage < 80) {
        counts.partialCompliance += 1;
      } else if (percentage <= 100) {
        counts.nearCompliance += 1;
      } else {
        counts.overCompliance += 1;
      }
    });

    return [
      { name: 'Zero', value: counts.zeroLog },
      { name: '1-50%', value: counts.lowCompliance },
      { name: '51-79%', value: counts.partialCompliance },
      { name: '80-100%', value: counts.nearCompliance },
      { name: '+100%', value: counts.overCompliance },
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
            color: ({ dataIndex }) =>
              ['#b13a3a', '#d08a1f', '#c9a227', '#20a57a', '#1f66b3'][dataIndex],
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

  /** Opens Azure Users filtered to the clicked compliance bar. */
  protected openComplianceBucket(event: { dataIndex?: number }): void {
    const queryParams = complianceBucketQuery(
      event.dataIndex ?? -1,
      this.dateService.targetHoursCount(),
    );
    if (queryParams) {
      this.router.navigate(['/users/azure'], { queryParams });
    }
  }

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

  exportTargetAchievementToXlsx(): void {
    const chartData = this.chartData();
    const dateRangeLabel = this.selectedDateRangeLabel();
    const workingDays = this.weekdays;
    const activeUsers = this.azureUsersKpis().usersWithHours;

    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Target Achievement Report ' + `(${dateRangeLabel})`],
      [],
      ['Metric', 'Value'],
      ['Achieved Hours Without Extra Hours', `${chartData.achievedHours.toFixed(1)}h`],
      ['Target Hours', `${chartData.targetHours.toFixed(1)}h`],
      ['Achievement Percentage', `${chartData.percentage}%`],
      [],
      ['Additional Information', ''],
      ['Working Days', workingDays],
      ['Active Users', activeUsers],
      [],
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Target Achievement');
    XLSX.writeFile(workbook, 'Target_Achievement_Report.xlsx');
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

  /** Resolves to null instead of erroring so one failed source only blanks its own cards. */
  private settle<T>(failed: WritableSignal<boolean>): OperatorFunction<T, T | null> {
    return (source) =>
      source.pipe(
        tap(() => failed.set(false)),
        catchError(() => {
          failed.set(true);
          return of(null);
        }),
      );
  }

  protected reload(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);

    forkJoin({
      azureUsers: this.usersService.getAzureUsers().pipe(this.settle(this.usersFailed)),
      projectsHours: this.dashboardService
        .getProjectsHours()
        .pipe(this.settle(this.projectsFailed)),
      topPerformers: this.dashboardService
        .getTopPerformers()
        .pipe(this.settle(this.performersFailed)),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ projectsHours, topPerformers }) => {
        this.projectsHours.set(projectsHours);
        this.topPerformers.set(topPerformers);
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
    const chartData = this.chartData();
    const achieved = chartData.achievedHours;
    const target = chartData.targetHours;
    const percent = target > 0 ? +((achieved / target) * 100).toFixed(1) : 0;

    return {
      title: {
        text: '',
        left: 'start',
        subtext: '',
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
              `{percent|${this.chartData().percentage}%}\n{hours|${this.chartData().achievedHours.toFixed(1)}h / ${this.chartData().targetHours.toFixed(1)}h}`,
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
