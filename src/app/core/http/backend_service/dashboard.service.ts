import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { ProjectsHours, Project } from '../../models/reponse/projects-hours.response.model';
import { UsersService } from './azure-users.service';
import { ApiService } from '../api_services/api.service';
import { TopPerformersResponse, User } from '../../models/reponse/top-performers.response.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiService = inject(ApiService);
  private readonly usersService = inject(UsersService);

  private topPerformersEndpoint = 'AzureDevOps/top-performers';
  private projectsKpisEndpoint = 'AzureDevOps/projects-hours';

  getProjectsHours(): Observable<ProjectsHours> {
    return this.apiService
      .get<ProjectsHours>(this.projectsKpisEndpoint)
  }

  getTopPerformers(): Observable<User[]> {
    return this.apiService
      .get<TopPerformersResponse>(this.topPerformersEndpoint)
      .pipe(map((response) => response.users));
  }
}
