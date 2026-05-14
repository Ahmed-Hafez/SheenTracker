// import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { catchError, switchMap, filter, take, throwError } from 'rxjs';
// import { AuthService } from '../../../auth/auth/auth.service';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // Skip adding token to authorization endpoints
//   const skipRefreshUrls = [
//     '/Authorize?email',
//     '/Authorize/refresh-token',
//     '/otp',
//     '/select-channel',
//     '/new-password/:activationCode'
//   ];

//   if (skipRefreshUrls.some((url) => req.url.includes(url))) {
//     return next(req);
//   }

//   const token = authService.getToken();
//   const authReq = token ? req.clone({
//     setHeaders: { Authorization: token }
//   }) : req;

//   return next(authReq).pipe(
//     catchError(error => {
//       if (error instanceof HttpErrorResponse && error.status === 401) {
//         const username = authService
//           .getStoredClaims()
//           .find((c) => c.type === 'name')?.value;

//         if (!username) {
//           return throwError(() => error);
//         }

//         // Handle token refresh
//         if (!authService.isRefreshing) {
//           authService.isRefreshing = true;
//           authService.refreshTokenSubject.next(null);

//           return authService.refreshToken().pipe(
//             switchMap(response => {
//               authService.isRefreshing = false;
//               authService.refreshTokenSubject.next(response.token);
//               // Retry the original request with new token
//               const newReq = authReq.clone({
//                 setHeaders: { Authorization: response.token }
//               });
//               return next(newReq);
//             }),
//             catchError(refreshError => {
//               authService.isRefreshing = false;
//               authService.logout();
//               router.navigate(['/login']);
//               return throwError(() => refreshError);
//             })
//           );
//         } else {
//           // Wait until token is refreshed
//           return authService.refreshTokenSubject.pipe(
//             filter(token => token !== null),
//             take(1),
//             switchMap(token => {
//               const newReq = authReq.clone({
//                 setHeaders: { Authorization: token! }
//               });
//               return next(newReq);
//             })
//           );
//         }
//       }
//       return throwError(() => error);
//     })
//   );
// };