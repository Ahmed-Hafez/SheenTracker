import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AzureUsersComponent } from './features/azure-users/azure-users.component';
import { SystemUsersComponent } from './features/system-users/system-users.component';

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
          }
        ],
      },
    ],
  },
];
