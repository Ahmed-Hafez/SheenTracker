import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { ProjectsHours, Project } from '../../models/reponse/projects-hours.response.model';
import { UsersService } from './azure-users.service';
import { ApiService } from '../api_services/api.service';
import { TopPerformersResponse, User } from '../../models/reponse/top-performers.response.model';
import { DateService } from '../../services/date.service';

interface TargetAchievmentChartData {
  targetHours: number;
  achievedHours: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiService = inject(ApiService);
  private readonly metaDataService = inject(UsersService);
  private readonly dateService = inject(DateService);

  private topPerformersEndpoint = 'AzureDevOps/top-performers';
  private projectsKpisEndpoint = 'AzureDevOps/projects-hours';

  getProjectsHours(): Observable<ProjectsHours> {
    return this.apiService.get<ProjectsHours>(this.projectsKpisEndpoint).pipe(
      map((response) => {
        return {
          fromDate: response.fromDate,
          toDate: response.toDate,
          projectsCount: response.projectsCount,
          totalHours: Math.ceil(response.totalHours),
          projects: response.projects,
        };
      }),
    );
  }

  getTopPerformers(): Observable<User[]> {
    return this.apiService
      .get<TopPerformersResponse>(this.topPerformersEndpoint)
      .pipe(map((response) => response.users.reverse()));
  }

  getTargetAchievmentChartData(): TargetAchievmentChartData {
    const workDays = this.dateService.weekdaysCount;
    var expectedTargetHours = 0;
    var achievedHours = 0;
    const users = this.metaDataService.users$;
    // Calculate each User expected Hours
    // Calculate Minimum achieved Hours For Each User (Without extra hours)

    users().forEach((u) => {
      var userExpectedHours = (u.expectedHours || 6.5) * workDays();
      expectedTargetHours += userExpectedHours;
      achievedHours += Math.min(u.totalHours, userExpectedHours);
    });
    var percentage = Math.round((achievedHours / expectedTargetHours) * 100);

    var chartData: TargetAchievmentChartData = {
      targetHours: expectedTargetHours,
      achievedHours: achievedHours,
      percentage: percentage,
    };

    console.log('Target Achievment ChartData ', chartData);

    return chartData;
  }
}
