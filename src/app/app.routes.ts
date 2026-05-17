import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsersComponent } from './features/users/users.component';
import { UserDetailsComponent } from './features/user-details/user-details.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
        children: [
          {
            path: '',
            component: UsersComponent,
          },
          {
            path: ':userId',
            component: UserDetailsComponent,
          },
        ]
      }
    ],
  },
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./features/user-details/user-details.component').then((m) => m.UserDetailsComponent),
  },
];
