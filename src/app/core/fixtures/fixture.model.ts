import { HttpRequest } from '@angular/common/http';

export type FixtureMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface FixtureRequest {
  /** Values of the `:name` segments in the route path. */
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
  request: HttpRequest<unknown>;
}

export interface FixtureResult {
  status: number;
  body: unknown;
}

/**
 * One fake backend endpoint. `path` is relative to `environment.apiUrl`, without a leading slash,
 * with `:name` placeholders, e.g. `settings/:key`. Matching ignores case, like the real API.
 */
export interface FixtureRoute {
  method: FixtureMethod;
  path: string;
  handle(request: FixtureRequest): FixtureResult;
}

/** 200 wrapped in the backend's `ApiResponse<T>` envelope. */
export function ok<T>(data: T, message = ''): FixtureResult {
  return { status: 200, body: { success: true, statusCode: 200, message, data, errors: null } };
}

/** An error in the same envelope; the error interceptor reads `message` / `errors`. */
export function fail(
  status: number,
  message: string,
  errors: string[] | null = null,
): FixtureResult {
  return {
    status,
    body: { success: false, statusCode: status, message, data: null, errors },
  };
}
