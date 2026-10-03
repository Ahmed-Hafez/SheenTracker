import { HttpInterceptorFn } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ToastMessageOptions } from 'primeng/api';
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


       try{
         // {
//     "success": false,
//     "statusCode": 500,
//     "message": "Internal server error",
//     "data": null,
//     "errors": [
//         "Selected squad does not exist."
//     ]
// }
        // handleError(
        //   err.status,
        //   err.error?.ErrorCode,
        //   err.error?.ErrorMessage || err.error?.ErrorMsg,
        //   err.error?.Context,
        //   messageService,
        //   router,
        // );
       }catch{

       }
      // Case 2: JSON returned directly as object
      if (typeof err.error === 'object') {
        console.log('Error object:', err.error);
        handleError(
          err.status || err.statusCode,
          err.error?.ErrorCode,
          err.error?.ErrorMessage || err.error?.ErrorMsg || err.error?.message,
          err.error?.Context || err.error?.errors,
          messageService,
          router,
        );
      } else {
        // Case 3: plain text or unknown error
        handleError(err.status || err.statusCode, null, err.message, null, messageService, router);
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
    console.log('Context array:', context);
    finalErrorMessage = context.map((c: any) => {
      if(c.Value){
        return c.Value;
      }else if(typeof c === 'string'){
        return c;
      }
      return c.Value;
    }).join(', ');
  }

  switch (status) {
    case 0:
      notify(messageService, {
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
      notify(messageService, {
        severity: 'error',
        summary: 'Bad Request',
        detail: finalErrorMessage ?? 'Not a Valid Request',
        life: 10000,
      });
      break;
    case 401:
      // Redirect to login if unauthorized
      router.navigate(['/login']);
      notify(messageService, {
        severity: 'error',
        summary: 'Unauthorized',
        detail: finalErrorMessage ?? 'You do not have permission to access this resource.',
        life: 10000,
      });
      break;
    case 403:
      // Forbidden access
      notify(messageService, {
        severity: 'error',
        summary: 'Access Denied',
        detail: finalErrorMessage ?? 'You do not have permission to access this resource.',
        life: 10000,
      });
      break;
    case 404:
      // Resource not found
      notify(messageService, {
        severity: 'error',
        summary: 'Not Found',
        detail: finalErrorMessage ?? 'The requested resource was not found.',
        life: 10000,
      });
      break;

    case 405:
      // Method not allowed
      notify(messageService, {
        severity: 'error',
        summary: 'Method Not Allowed',
        detail: finalErrorMessage ?? 'The requested method is not allowed.',
        life: 10000,
      });
      break;

    case 429:
      // Too Many Requests
      notify(messageService, {
        severity: 'error',
        summary: 'Too Many Requests',
        detail: finalErrorMessage ?? 'Too many requests. Please try again in 5 seconds.',
        life: 10000,
      });
      break;
    case 500:
      // Internal server error
      notify(messageService, {
        severity: 'error',
        summary: 'Server Error',
        detail:
          finalErrorMessage ??
          'The server hit an error. Try again, and contact support if it keeps happening.',
        life: 10000,
      });
      break;
    default: {
      notify(messageService, {
        severity: 'error',
        summary: 'Request failed',
        detail:
          finalErrorMessage ??
          `The server could not complete the request${status ? ` (HTTP ${status})` : ''}. Try Refresh, or try again in a minute.`,
        life: 10000,
      });
      break;
    }
  }
}

const DUPLICATE_WINDOW_MS = 4000;
const recentToasts = new Map<string, number>();

/**
 * Shows an error toast unless the same one appeared moments ago, so a page whose
 * parallel requests all fail shows one message instead of a stack of identical ones.
 */
function notify(messageService: MessageService, message: ToastMessageOptions) {
  const key = `${message.summary}|${message.detail}`;
  const now = Date.now();
  const lastShown = recentToasts.get(key);
  if (lastShown !== undefined && now - lastShown < DUPLICATE_WINDOW_MS) {
    return;
  }
  recentToasts.set(key, now);
  messageService.add(message);
}
