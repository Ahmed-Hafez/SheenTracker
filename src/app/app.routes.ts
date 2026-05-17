import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./features/user-details/user-details.component').then((m) => m.UserDetailsComponent),
  },
];
