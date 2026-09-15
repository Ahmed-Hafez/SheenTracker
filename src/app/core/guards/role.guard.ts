import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../http/backend_service/auth.service';

/**
 * Role-based access control guard.
 * Protects routes by checking if the user has at least one of the required roles.
 * Redirects to /forbidden if the user lacks required roles.
 *
 * Usage:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [roleGuard(['Admin', 'Manager'])]
 * }
 *
 * @param requiredRoles - Array of role names. User must have at least one.
 * @returns A CanActivateFn that validates user roles
 */
export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userData = authService.getUserData();
    const userRoles = userData?.roles ?? [];

    // Check if user has at least one of the required roles
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (hasRequiredRole) {
      return true;
    }

    // User lacks required role - redirect to forbidden page
    router.navigate(['/forbidden']);
    return false;
  };
};
