import { inject } from '@angular/core';
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
import { PAGE_ROLES } from './core/utils/roles.util';
import { AuthService } from './core/http/backend_service/auth.service';
import { ShellRouteData } from './layout/shell-route-data';

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
    canActivate: [authGuard],
    component: ForbiddenComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        // Each role lands on a page it can open (Business and PMs go to Quarter Plans).
        redirectTo: () => inject(AuthService).getMainPageBasedOnUserRole(),
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        title: 'Dashboard - SheenTrack 360°',
        component: DashboardComponent,
        canActivate: [roleGuard(PAGE_ROLES.dashboard)],
        data: { header: 'Dashboard', dateScope: 'range', refresh: true } satisfies ShellRouteData,
      },
      {
        path: 'users',
        children: [
          {
            path: 'azure',
            title: 'Azure Users - SheenTrack 360°',
            component: AzureUsersComponent,
            canActivate: [roleGuard(PAGE_ROLES.azureUsers)],
            data: {
              header: 'Azure Users',
              dateScope: 'range',
              refresh: true,
            } satisfies ShellRouteData,
          },
          {
            path: 'system',
            title: 'System Users - SheenTrack 360°',
            component: SystemUsersComponent,
            canActivate: [roleGuard(PAGE_ROLES.systemUsers)],
            data: { header: 'System Users' } satisfies ShellRouteData,
          },
          {
            path: '',
            pathMatch: 'full',
            title: 'User Details - SheenTrack 360°',
            canActivate: [roleGuard(PAGE_ROLES.userDetails)],
            data: { header: 'User Details', dateScope: 'range' } satisfies ShellRouteData,
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
        canActivate: [roleGuard(PAGE_ROLES.squads)],
        children: [
          {
            path: '',
            title: 'Squads - SheenTrack 360°',
            component: SquadsComponent,
            data: { header: 'Squads' } satisfies ShellRouteData,
          },
          {
            path: ':squadId',
            title: 'Squad Details - SheenTrack 360°',
            component: SquadDetailsComponent,
            data: { header: 'Squad Details' } satisfies ShellRouteData,
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
            canActivate: [roleGuard(PAGE_ROLES.projectUtilization)],
            data: { header: 'Project Utilization' } satisfies ShellRouteData,
          },
        ],
      },
      {
        path: 'quarter-plans',
        title: 'Quarter Plans - SheenTrack 360°',
        canActivate: [roleGuard(PAGE_ROLES.quarterPlans)],
        data: { header: 'Quarter Plans', dateScope: 'quarter' } satisfies ShellRouteData,
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
            data: { header: 'All Epics' } satisfies ShellRouteData,
            loadComponent: () =>
              import('./features/quarter-plans/quarter-plans-epics/quarter-plans-all-epics.component').then(
                (m) => m.QuarterPlansAllEpicsComponent,
              ),
          },
          {
            path: 'all-metrics',
            title: 'All Metrics - SheenTrack 360°',
            canActivate: [roleGuard(PAGE_ROLES.allMetrics)],
            data: { header: 'All Metrics' } satisfies ShellRouteData,
            loadComponent: () =>
              import('./features/quarter-plans/quarter-plans-metrics/quarter-plans-all-metrics.component').then(
                (m) => m.QuarterPlansAllMetricsComponent,
              ),
          },
        ],
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [roleGuard(PAGE_ROLES.settings)],
        data: { header: 'Settings' } satisfies ShellRouteData,
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
            data: { refresh: true } satisfies ShellRouteData,
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
