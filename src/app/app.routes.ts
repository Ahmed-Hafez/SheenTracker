import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsersComponent } from './features/users/users.component';

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
            path: '',
            title: 'Users - SheenTrack 360°',
            component: UsersComponent,
          },
          {
            path: ':userId',
            title: 'User Details - SheenTrack 360°',
            loadComponent: () =>
              import('./features/user-details/user-details.component').then(
                (m) => m.UserDetailsComponent,
              ),
          },
        ],
      },
    ],
  },
];
