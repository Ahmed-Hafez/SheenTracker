import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, delay, catchError } from 'rxjs';
import { LoginRequest } from '../../models/request/login.request.model';
import { LoginResponse } from '../../models/reponse/login.response.model';
import { ApiService } from '../api_services/api.service';

const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'auth_user_data';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);

  /** Reactive signal indicating whether the user is authenticated */
  isAuthenticated = signal<boolean>(this.hasToken());

  /** Reactive signal indicating a login request is in progress */
  isLoading = signal<boolean>(false);
  authEndpoint = 'auth/login';

  /* Authenticates the user with the provided credentials. */
  login(request: LoginRequest): Observable<LoginResponse> {
    this.isLoading.set(true);
    return this.apiService.post<LoginResponse>(this.authEndpoint, request).pipe(
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Handles post-login: caches the token and updates auth state.
   */
  handleLoginSuccess(response: LoginResponse): void {
    this.cacheToken(response.token);
    this.cacheuserData({
      roles: response.roles,
      email: response.email,
      fullName: response.fullName,
    });
    this.isAuthenticated.set(true);
    this.isLoading.set(false);
  }

  /**
   * Logs out the user: clears cached tokens and redirects to login.
   */
  logout(): void {
    this.clearTokens();
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  // ─── Token Cache Management ───────────────────────────────────────

  /** Stores the auth token in localStorage */
  private cacheToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }
  /** Stores the user data in localStorage */
  private cacheuserData(userData: { roles: string[]; email: string; fullName: string }): void {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }

  /** Stores the refresh token in localStorage */
  private cacheRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  /** Retrieves the cached auth token */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Retrieves the cached user data */
  getUserData(): { roles: string[]; email: string; fullName: string } | null {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /** Retrieves the cached refresh token */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /** Checks if a token exists in cache */
  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  /** Removes all auth-related data from cache */
  private clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }
}
