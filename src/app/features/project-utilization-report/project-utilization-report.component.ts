import { Component, computed, Pipe, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { projectUtlilizationMockData } from '../../core/mock/project-utilization.mock';
import { ProjectUtilization } from '../../core/models/reponse/project-utilization.model';
import { EChartsOption } from 'echarts/types/dist/shared';
import { TableModule } from "primeng/table";
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-project-utilization-report',
  imports: [NgxEchartsDirective, TableModule, DecimalPipe],
  templateUrl: './project-utilization-report.component.html',
  styleUrl: './project-utilization-report.component.scss',
})
export class ProjectUtilizationReportComponent {
  readonly projectsMock = signal<ProjectUtilization[]>(projectUtlilizationMockData);
  
  
   hoursPerProject = computed<EChartsOption>(() => {
    const data = this.projectsMock();
    if (!data) return {};
    return {
      title: {
        text: 'Hours Per Project',
        left: 'start',
        subtext: ' ',
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
      }, 
      legend: { show: true },
      xAxis: { type: 'value', nameLocation: 'middle', nameGap: 30 }, // numbers on X
      yAxis: {
        type: 'category',
        data: data.map((project) => project.projectName),
      }, // names on Y
      series: [
      {
        name: 'Active',
        type: 'bar',
        stack: 'tasks',
        data: data.map(project => project.activeTasks),
      },
      {
        name: 'Resolved',
        type: 'bar',
        stack: 'tasks',
        data: data.map(project => project.resolvedTasks),
      },
      {
        name: 'Closed',
        type: 'bar',
        stack: 'tasks',
        data: data.map(project => project.closedTasks),
      },
    ],
    };
  });
  
  
  projectsWorkloadOptions = computed<EChartsOption>(() => {
    const data = this.projectsMock();
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
          const project = data.find((p) => p.projectName === name);
          return `{name|${name}}{value|${project?.hours.toFixed(2) ?? 0}h}`;
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
        data: data.filter((p) => p.hours > 0).map((p) => p.projectName),
      },
      series: [
        {
          type: 'pie',
          data: data
            .filter((p) => p.hours > 0)
            .map((project) => {
              return { name: project.projectName, value: Number(project.hours.toFixed(2)) };
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

  columns = [
      { field: 'projectName', header: 'Project Name' },
      { field: 'hourse', header: 'Hours' },
      { field: 'headCount', header: 'Head Count' },
      { field: 'totalTasks', header: 'Work Items' },
      { field: 'topContributer', header: 'Top Contributer' },
    ];
}
