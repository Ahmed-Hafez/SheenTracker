import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts/types/dist/shared';
import { EpicsByTaskType } from '../../../../../../core/models/reponse/quarter-plans-dashboard.response';

@Component({
  selector: 'app-task-type',
  imports: [NgxEchartsDirective],
  templateUrl: './task-type.component.html',
  styleUrl: './task-type.component.scss',
})
export class TaskTypeComponent {
  taskType = input.required<EpicsByTaskType>();

  progressPercent = computed(() => Math.round(this.taskType().completionPercent));

  progressGaugeOptions = computed<EChartsOption>(() => {
    const percent = this.progressPercent();

    return {
      series: [
        {
          type: 'gauge',
          renderer: 'svg',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: '100%',
          center: ['50%', '90%'],
          axisLine: {
            lineStyle: {
              width: 8,
              color: [
                [0.25, '#1d9e75'],
                [0.75, '#ba7517'],
                [1, '#ac312c'],
              ],
            },
          },
          progress: { show: false },
          pointer: { show: false },
          anchor: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '-15%'],
            formatter: () => `{percent|${percent}%}\n{label|PROGRESS}`,
            rich: {
              percent: {
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'DM Mono, monospace',
                color: '#1D1D1B',
                lineHeight: 18,
              },
              label: {
                fontSize: 7,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 600,
                color: '#9A9A9A',
                lineHeight: 10,
                padding: [1, 0, 0, 0],
              },
            },
          },
          data: [{ value: percent }],
        },
      ],
    };
  });
}
