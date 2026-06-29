import { Component, computed, inject, OnInit, Pipe, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ProjectUtilizationResponse} from '../../core/models/reponse/project-utilization.model';
import { EChartsOption } from 'echarts/types/dist/shared';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';
import { ProjectsUtilizationReportService } from '../../core/http/backend_service/projects-utilization-report.service';
import { Router } from '@angular/router';
import { ProjectUtilizationSkeletonComponent } from './components/loading shimmer component/project-utilization-skeleton.component';
import { ngxCsv } from 'ngx-csv/ngx-csv';

@Component({
  selector: 'app-project-utilization-report',
  imports: [NgxEchartsDirective, TableModule, DecimalPipe, ProjectUtilizationSkeletonComponent],
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
      //sort projects by total work items in descending order
      data.projects.sort((a, b) => b.totalWorkItems - a.totalWorkItems);
      this.projectsMock.set(data);
      this.isLoading.set(false);
    });
  }


  tasksPerProject = computed<EChartsOption>(() => {
    const data = this.projectsMock();
    if (!data) return {};
    const reversedProjects = [...data.projects].reverse(); // Reverse the order of projects for better visualization
    return {
      title: {
        text: 'Tasks Per Project',
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
        data: reversedProjects.map((project) => project.projectName),
      }, // names on Y
      series: [
        {
          name: 'Active',
          type: 'bar',
          stack: 'tasks',
          data: reversedProjects.map((project) => project.activeTasks),
        },
        {
          name: 'Resolved',
          type: 'bar',
          stack: 'tasks',
          data: reversedProjects.map((project) => project.resolvedTasks),
        },
        {
          name: 'Closed',
          type: 'bar',
          stack: 'tasks',
          data: reversedProjects.map((project) => project.closedTasks),
        },
      ],
    };
  });

  projectsWorkloadOptions = computed<EChartsOption>(() => {
    const data = this.projectsMock();
    if (!data) return {};
    const totalHours = Math.ceil(data.projects.reduce((sum, project) => sum + project.totalHours, 0));
    return {
      title: {
        text: 'Workload by project',
        left: 'start',
        subtext: `${totalHours}h total hours`,
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
    { field: 'percentage', header: 'PERCENTAGE' },
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

  exportToCSV() {
    const data = this.projectsMock();
    if (!data) return;

    const totalHours = data.projects.reduce((sum, p) => sum + p.totalHours, 0);

    const rows = data.projects.map((p) => ({
      projectName: p.projectName,
      totalHours: p.totalHours.toFixed(1),
      percentage: totalHours > 0 ? ((p.totalHours / totalHours) * 100).toFixed(1) + '%' : '0%',
      totalWorkItems: p.totalWorkItems,
      activeTasks: p.activeTasks,
      resolvedTasks: p.resolvedTasks,
      closedTasks: p.closedTasks,
      topDeveloperName: p.topDeveloperName || 'N/A',
      topDeveloperHours: p.topDeveloperHours,
    }));

    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: false,
      useTextFile: false,
      useBom: true,
      headers: [
        'Project',
        'Total Hours',
        '% of Total',
        'Work Items',
        'Active Tasks',
        'Resolved Tasks',
        'Closed Tasks',
        'Top Developer',
        'Top Developer Hours',
      ],
    };

    const filename = `Projects_Utilization_${data.fromDate}_to_${data.toDate}`;
    new ngxCsv(rows, filename, options);
  }
  percentageOfTotalHours(projectHours: number): number {
    const data = this.projectsMock();
    if (!data) return 0;
    const totalHours = data.projects.reduce((sum, project) => sum + project.totalHours, 0);
    return totalHours > 0 ? (projectHours / totalHours) * 100 : 0;
  }
}
