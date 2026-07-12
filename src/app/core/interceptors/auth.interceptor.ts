import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, filter, take, throwError } from 'rxjs';
import { AuthService } from '../http/backend_service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip adding token to authorization endpoints
  const skipRefreshUrls = [
    '/Authorize?email',
    '/Authorize/refresh-token',
    '/otp',
    '/select-channel',
    '/new-password/:activationCode',
  ];

  if (skipRefreshUrls.some((url) => req.url.includes(url))) {
    return next(req);
  }

  const token = authService.getToken();
  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: token },
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Handle token refresh
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
