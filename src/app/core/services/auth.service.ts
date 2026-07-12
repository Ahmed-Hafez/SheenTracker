import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, delay } from 'rxjs';
import { LoginRequest } from '../models/request/login.request.model';
import { LoginResponse } from '../models/reponse/login.response.model';

// Static credentials for development — will be replaced with real API calls
const STATIC_EMAIL = 'admin@sheentrack.com';
const STATIC_PASSWORD = 'sheen360';
const STATIC_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sheentrack360.dev-token';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Reactive signal indicating whether the user is authenticated */
  isAuthenticated = signal<boolean>(this.hasToken());

  /** Reactive signal indicating a login request is in progress */
  isLoading = signal<boolean>(false);

  constructor(private readonly router: Router) {}

  /**
   * Authenticates the user with the provided credentials.
   * Currently uses static validation — ready to be swapped with an HTTP call.
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    this.isLoading.set(true);

    // TODO: Replace with real API call → this.apiService.post<LoginResponse>('Auth/login', request)
    if (request.email === STATIC_EMAIL && request.password === STATIC_PASSWORD) {
      const response: LoginResponse = {
        token: STATIC_TOKEN,
        refreshToken: 'refresh-token-placeholder',
        expiresIn: 3600,
      };
      return of(response).pipe(delay(600)); // Simulate network latency
    }

    return throwError(() => ({
      status: 401,
      error: { message: 'Invalid email or password' },
    }));
  }

  /**
   * Handles post-login: caches the token and updates auth state.
   */
  handleLoginSuccess(response: LoginResponse): void {
    this.cacheToken(response.token);
    if (response.refreshToken) {
      this.cacheRefreshToken(response.refreshToken);
    }
    this.isAuthenticated.set(true);
    this.isLoading.set(false);
  }

  /**
   * Logs out the user: clears cached tokens and redirects to login.
   */
  logout(): void {
    // TODO: Replace with real API call → this.apiService.post('Auth/logout', {})
    this.clearTokens();
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  // ─── Token Cache Management ───────────────────────────────────────

  /** Stores the auth token in localStorage */
  private cacheToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /** Stores the refresh token in localStorage */
  private cacheRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  /** Retrieves the cached auth token */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
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
  }
}
