import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import {
  DashboardResponse,
  DashboardUser,
  project,
  projectsKpis,
  TopUser,
  UsersKpis,
} from '../../models/reponse/dashboard.response.model';
import { UsersService } from './users.service';
import { ApiService } from '../api_services/api.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiService = inject(ApiService);
  private readonly usersService = inject(UsersService);

  private usersEndpoint = 'AzureDevOps/users';
  private projectsKpisEndpoint = 'AzureDevOps/projects-hours';

  getDashboardData(): Observable<DashboardResponse> {
    return forkJoin([this.getDashboardUsers(), this.getProjectsKpis()]).pipe(
      map(([dashboardUsers, projectsKpis]) => {
        console.log('Dashboard Users:', dashboardUsers);
        console.log('Projects KPIs:', projectsKpis);
        return {
          projectsKpis,
          dashboardUsers,
        } as DashboardResponse;
      }),
    );
  }

  private getProjectsKpis(): Observable<project[]> {
    // return this.apiService.get('projects-kpis');
    return this.apiService
      .get<projectsKpis>(this.projectsKpisEndpoint)
      .pipe(map((response) => response.projects));
  }

  private getDashboardUsers(): Observable<DashboardUser> {
    let topUsers: TopUser[] = [];
    let usersKpis: UsersKpis = {} as UsersKpis;
    let dashboardUsers: DashboardUser = {} as DashboardUser;

    return this.usersService.getUsers().pipe(
      map((response) => {
        console.log('Users Response in DashboardService:', response); 
        topUsers = response.users
          .sort((a, b) => b.totalHours - a.totalHours)
          .slice(0, 10)
          .map((user) => ({
            displayName: user.displayName,
            totalHours: user.totalHours,
          }));
        usersKpis = {
          totalHours: response.totalHours,
          totalUsers: response.totalUsers,
          usersWithHours: response.usersWithHours,
        }

        dashboardUsers = {
          userKpis: usersKpis,
          topUsers: topUsers,
        };

        return dashboardUsers;
      }),
    );
  }
}
