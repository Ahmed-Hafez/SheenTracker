import { Component, computed, inject, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts/types/dist/shared';
import { DateService } from '../../../../core/services/date.service';
import { QuarterPlansService } from '../../../../core/http/backend_service/quarter-plans.service';
import { ScheduleProgressChartSkeletonComponent } from './schedule-progress-chart-skeleton/schedule-progress-chart-skeleton.component';

@Component({
  selector: 'app-schedule-progress-chart',
  imports: [NgxEchartsDirective, ScheduleProgressChartSkeletonComponent],
  templateUrl: './schedule-progress-chart.component.html',
  styleUrl: './schedule-progress-chart.component.scss',
})
export class ScheduleProgressChartComponent {
  private readonly qPlansDashboardService = inject(QuarterPlansService);
  readonly isLoading = this.qPlansDashboardService.isLoading;

  readonly scheduleStatus = computed(() => {
    const elapsed = this.qPlansDashboardService.calendarElapsedPercent();
    const completed = this.qPlansDashboardService.qplansDashboardData().completionPercentEffort;

    if (completed < elapsed - 1) {
      return 'Behind Schedule';
    }

    if (completed > elapsed + 1) {
      return 'Ahead of Schedule';
    }

    return 'On Schedule';
  });

  readonly scheduleStatusClass = computed(() => {
    const status = this.scheduleStatus();

    if (status === 'Ahead of Schedule') {
      return 'schedule-badge--ahead';
    }

    if (status === 'On Schedule') {
      return 'schedule-badge--on-track';
    }

    return 'schedule-badge--behind';
  });

  readonly scheduleProgress = computed<EChartsOption>(() => {
    const calendarElapsed = this.qPlansDashboardService.calendarElapsedPercent();
    const effortCompleted =
      this.qPlansDashboardService.qplansDashboardData().completionPercentEffort;

    return {
      animation: true,
      grid: {
        left: 10,
        right: 22,
        top: 18,
        bottom: 56,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const rows = params
            .filter(
              (item: { value?: number | null }) => item.value !== null && item.value !== undefined,
            )
            .map(
              (item: { seriesName?: string; value?: number; color?: string }) =>
                `<span style="display:inline-block;width:10px;height:10px;background:${item.color};margin-right:6px;border-radius:2px;"></span>${item.seriesName}: ${Number(item.value ?? 0).toFixed(0)}`,
            )
            .join('<br/>');
          return `<div style="font-weight:600;margin-bottom:4px;">Progress (%)</div>${rows}`;
        },
      },
      legend: {
        show: true,
        bottom: 8,
        left: 'center',
        icon: 'rect',
        itemWidth: 46,
        itemHeight: 14,
        textStyle: {
          color: '#6b7280',
          fontSize: 14,
        },
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 10,
        axisLabel: {
          color: '#6b7280',
          fontSize: 14,
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#e5e7eb',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: ['Calendar Elapsed', 'Effort Completed'],
        axisLabel: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
      },
      series: [
        {
          name: 'Effort Completed',
          type: 'bar',
          stack: 'total',
          barWidth: 22,
          barCategoryGap: '45%',
          data: [effortCompleted, null],
          itemStyle: {
            color: '#ef4444',
          },
        },
        {
          name: 'Calendar Elapsed',
          type: 'bar',
          stack: 'total',
          barWidth: 22,
          barCategoryGap: '45%',
          data: [null, calendarElapsed],
          itemStyle: {
            color: '#6f7f94',
          },
        },
      ],
    };
  });
}
