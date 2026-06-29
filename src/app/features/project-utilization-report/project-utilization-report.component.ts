import { Component, computed, inject, OnInit, Pipe, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ProjectUtilizationResponse} from '../../core/models/reponse/project-utilization.model';
import { EChartsOption } from 'echarts/types/dist/shared';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';
import { ProjectsUtilizationReportService } from '../../core/http/backend_service/projects-utilization-report.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-utilization-report',
  imports: [NgxEchartsDirective, TableModule, DecimalPipe],
  templateUrl: './project-utilization-report.component.html',
  styleUrl: './project-utilization-report.component.scss',
})
export class ProjectUtilizationReportComponent implements OnInit {
  readonly projectsMock = signal<ProjectUtilizationResponse | null>(null);
  isLoading = signal(false);
  projectsUtilReportService = inject(ProjectsUtilizationReportService);
  router = inject(Router);

  ngOnInit() {
    this.loadProjectUtilizationData();
  }

  loadProjectUtilizationData() {
    this.isLoading.set(true);
    this.projectsUtilReportService.getProjectUtilizationData().subscribe((data) => {
      this.projectsMock.set(data);
      this.isLoading.set(false);
    });
  }


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
        data: data.projects.map((project) => project.projectName),
      }, // names on Y
      series: [
        {
          name: 'Active',
          type: 'bar',
          stack: 'tasks',
          data: data.projects.map((project) => project.activeTasks),
        },
        {
          name: 'Resolved',
          type: 'bar',
          stack: 'tasks',
          data: data.projects.map((project) => project.resolvedTasks),
        },
        {
          name: 'Closed',
          type: 'bar',
          stack: 'tasks',
          data: data.projects.map((project) => project.closedTasks),
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
          const project = data.projects.find((p) => p.projectName === name);
          return `{name|${name}}{value|${Math.ceil(project?.totalHours ?? 0)}h}`;
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
              return { name: project.projectName, value: Math.ceil(project.totalHours) };
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
    { field: 'projectName', header: 'PROJECT' },
    { field: 'totalHours', header: 'TOTAL HOURS' },
    { field: 'totalWorkItems', header: 'WORK ITEMS' },
    { field: 'topDeveloperName', header: 'TOP DEVELOPER' },
    { field: 'topDeveloperHours', header: 'TOP DEVELOPER HOURS' },
  ];

  navigateToAzureUser(azureUserKey: string | null | undefined) {
    console.log(`Navigating to Azure user: ${azureUserKey}`);
    if(azureUserKey){
      // Implementation for navigating to Azure user
      this.router.navigate(['users'], { queryParams: { userKey: azureUserKey } });
    }
  }
}
