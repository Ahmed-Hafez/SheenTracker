import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AzureUsersComponent } from './features/azure-users/azure-users.component';
import { SystemUsersComponent } from './features/system-users/system-users.component';
import { SquadsComponent } from './features/squads/squads.component';
import { SquadDetailsComponent } from './features/squad-details/squad-details.component';
import { ProjectUtilizationReportComponent } from './features/project-utilization-report/project-utilization-report.component';
import { LoginComponent } from './features/login/login.component';
import { SettingsComponent } from './features/settings/base-settings/settings.component';
import { ForbiddenComponent } from './features/forbidden/forbidden.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign In - SheenTrack 360°',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'forbidden',
    title: 'Access Denied - SheenTrack 360°',
    component: ForbiddenComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
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
        canActivate: [roleGuard(['HR', 'Coordination'])],
      },
      {
        path: 'users',
        children: [
          {
            path: 'azure',
            title: 'Azure Users - SheenTrack 360°',
            component: AzureUsersComponent,
            canActivate: [roleGuard(['HR', 'Coordination'])],
          },
          {
            path: 'system',
            title: 'System Users - SheenTrack 360°',
            component: SystemUsersComponent,
            canActivate: [roleGuard(['HR', 'Coordination'])],
          },
          {
            path: '',
            pathMatch: 'full',
            title: 'User Details - SheenTrack 360°',
            canActivate: [roleGuard(['HR', 'Coordination'])],
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
        canActivate: [roleGuard(['Coordination'])],
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
        children: [
          {
            path: 'project-utilization',
            title: 'Project Utilization - SheenTrack 360°',
            component: ProjectUtilizationReportComponent,
            canActivate: [roleGuard(['HR', 'Coordination'])],
          },
        ],
      },
      {
        path: 'quarter-plans',
        title: 'Enterprise Quarterly Planning - SheenTrack 360°',
        canActivate: [roleGuard(['Business', 'Coordination'])],
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/quarter-plans/quarter-plans-dashboard/quarter-plans.component').then(
                (m) => m.QuarterPlansComponent,
              ),
          },
          {
            path: 'all-epics',
            title: 'All Epics - SheenTrack 360°',
            loadComponent: () =>
              import('./features/quarter-plans/quarter-plans-epics/quarter-plans-all-epics.component').then(
                (m) => m.QuarterPlansAllEpicsComponent,
              ),
          },
        ],
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [roleGuard(['Coordination'])],
        children: [
          {
            path: '',
            redirectTo: 'users-permisions',
            pathMatch: 'full',
          },
          {
            path: 'general',
            title: 'General Settings - SheenTrack 360°',
            loadComponent: () =>
              import('./features/settings/general/general.component').then(
                (m) => m.GeneralComponent,
              ),
          },
          {
            path: 'users-permisions',
            title: 'Users & Permissions - SheenTrack 360°',
            loadComponent: () =>
              import('./features/settings/users-permisions/users-permisions.component').then(
                (m) => m.UsersPermisionsComponent,
              ),
          },
        ],
      },
    ],
  },
];
