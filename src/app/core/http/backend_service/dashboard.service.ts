import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, of } from 'rxjs';
import { DashboardResponse } from '../../models/reponse/dashboard.response.model';
import { DASHBOARD_PROJECTS_KPIS_RESPONSE } from '../../mock/dashboard.mock';
import { UsersService } from './users.service';
import { ApiService } from '../api_services/api.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiService = inject(ApiService);
  private readonly usersService = inject(UsersService);

  private usersEndpoint = '/users';
  private projectsKpisEndpoint = '/projects-hours';

  getDashboardData() {
    return forkJoin([this.getUsersKpis(), this.getProjectsKpis(), this.getTopUsers()]).pipe(
      map(([usersKpis, projectsKpis, topUsers]) => {
        return {
          usersKpis,
          projectsKpis,
          topUsers,
        } as DashboardResponse;
      }),
    );
  }

  private getUsersKpis() {
    // return this.apiService.get('users-kpis');
    return this.usersService.getUsersKpis();
  }

  private getProjectsKpis() {
    // return this.apiService.get('projects-kpis');
    return of(DASHBOARD_PROJECTS_KPIS_RESPONSE);
  }

  private getTopUsers() {
    // return this.apiService.get('top-users');
    return of(
      this.usersService
        .getUsers()
        .sort((a, b) => b.totalHours - a.totalHours)
        .slice(0, 10)
        .map((user) => ({
          displayName: user.displayName,
          totalHours: user.totalHours,
        })),
    );
  }
}
