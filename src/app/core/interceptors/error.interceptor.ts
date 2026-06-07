import { HttpInterceptorFn } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
// import { AuthService } from '../../../auth/auth/auth.service';
// import { formatToDuration } from '../../../shared/helpers/helper';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  return next(req).pipe(
    catchError((err) => {
       if (err.error instanceof Blob && err.error.type.includes('json')) {
         // Case 1: JSON returned as Blob
         return from(err.error.text()).pipe(
           switchMap((text) => {
             try {
               const errorJson = JSON.parse(text as string);
               handleError(
                 err.status,
                 errorJson?.ErrorCode,
                 errorJson?.ErrorMessage || errorJson?.ErrorMsg,
                 errorJson?.Context,
                 messageService,
                 router,
               );
             } catch {
               handleError(err.status, null, null, null, messageService, router);
             }
             return throwError(() => err);
           }),
         );
       }


      // Case 2: JSON returned directly as object
      if (typeof err.error === 'object') {
        handleError(
          err.status,
          err.error?.ErrorCode,
          err.error?.ErrorMessage || err.error?.ErrorMsg,
          err.error?.Context,
          messageService,
          router,
        );
      } else {
        // Case 3: plain text or unknown error
        handleError(err.status, null, err.message, null, messageService, router);
      }

      return throwError(() => err);
    }),
  );
};
function handleError(
  status: number,
  errorCode: string | null | undefined,
  errorMessage: string | null | undefined,
  context: any[] | null | undefined,
  messageService: MessageService,
  router: Router,
) {
  let finalErrorMessage = errorMessage;
  if (context && Array.isArray(context) && context.length > 0) {
    finalErrorMessage = context.map((c: any) => c.Value).join(', ');
  }

  switch (status) {
    case 0:
      messageService.add({
        severity: 'error',
        summary: 'Network Error',
        detail:
          finalErrorMessage ??
          'Unable to connect to the server. Please check your internet connection.',
        life: 10000,
      });
      break;
    case 400:
      // Bad Request
      messageService.add({
        severity: 'error',
        summary: 'Bad Request',
        detail: finalErrorMessage ?? 'Not a Valid Request',
        life: 10000,
      });
      break;
    case 401:
      // Redirect to login if unauthorized
      router.navigate(['/login']);
      messageService.add({
        severity: 'error',
        summary: 'Unauthorized',
        detail: finalErrorMessage ?? 'You do not have permission to access this resource.',
        life: 10000,
      });
      break;
    case 403:
      // Forbidden access
      messageService.add({
        severity: 'error',
        summary: 'Access Denied',
        detail: finalErrorMessage ?? 'You do not have permission to access this resource.',
        life: 10000,
      });
      break;
    case 404:
      // Resource not found
      messageService.add({
        severity: 'error',
        summary: 'Not Found',
        detail: finalErrorMessage ?? 'The requested resource was not found.',
        life: 10000,
      });
      break;

    case 405:
      // Method not allowed
      messageService.add({
        severity: 'error',
        summary: 'Method Not Allowed',
        detail: finalErrorMessage ?? 'The requested method is not allowed.',
        life: 10000,
      });
      break;

    case 429:
      // Too Many Requests
      messageService.add({
        severity: 'error',
        summary: 'Too Many Requests',
        detail: finalErrorMessage ?? 'Too many requests. Please try again in 5 seconds.',
        life: 10000,
      });
      break;
    case 500:
      // Internal server error
      messageService.add({
        severity: 'error',
        summary: 'Server Error',
        detail: finalErrorMessage ?? 'Internal Server Error.',
        life: 10000,
      });
      break;
    default: {
      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: finalErrorMessage ?? 'Unexpected Error.',
        life: 10000,
      });
      break;
    }
  }
}
