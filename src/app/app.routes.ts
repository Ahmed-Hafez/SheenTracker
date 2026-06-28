import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AzureUsersComponent } from './features/azure-users/azure-users.component';
import { SystemUsersComponent } from './features/system-users/system-users.component';
import { SquadsComponent } from './features/squads/squads.component';
import { SquadDetailsComponent } from './features/squad-details/squad-details.component';
import { ProjectUtilizationReportComponent } from './features/project-utilization-report/project-utilization-report.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        title: 'Dashboard - SheenTrack 360°',
        component: DashboardComponent,
      },
      {
        path: 'users',
        children: [
          {
            path: 'azure',
            title: 'Azure Users - SheenTrack 360°',
            component: AzureUsersComponent,
          },
          {
            path: 'system',
            title: 'System Users - SheenTrack 360°',
            component: SystemUsersComponent,
          },
          {
            path: '',
            pathMatch: 'full',
            title: 'User Details - SheenTrack 360°',
            loadComponent: () =>
              import('./features/user-details/user-details.component').then(
                (m) => m.UserDetailsComponent,
              ),
          },
        ],
      },
      {
        path: 'squads',
        title: 'Squads - SheenTrack 360°',
        children: [
          {
            path: '',
            title: 'Squads - SheenTrack 360°',
            component: SquadsComponent,
          },
          {
            path: ':squadId',
            title: 'Squad Details - SheenTrack 360°',
            component: SquadDetailsComponent,
          },
        ],
      },
      {
        path: 'reports',
        title: 'Reports - SheenTrack 360°',
        loadComponent: () =>
          import('./features/project-utilization-report/project-utilization-report.component').then(
            (m) => m.ProjectUtilizationReportComponent,
          ),
      },
    ],
  },
];
