import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { delay, dematerialize, materialize, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { fail, FixtureResult, FixtureRoute } from './fixture.model';
import { FIXTURE_ROUTES } from './index';

/** Enough latency to see loading states and to catch double-submits. */
const LATENCY_MS = 400;

/**
 * Serves every API call from `FIXTURE_ROUTES` instead of the backend. Registered only by
 * `provideFixtures()`, i.e. when the app runs with `npm run start:fixtures`.
 * A call with no fixture fails with 501 and a toast naming it, so a missing fixture is obvious.
 */
export const fixtureInterceptor: HttpInterceptorFn = (req) => {
  const url = new URL(req.urlWithParams, location.origin);
  const apiPath = url.href.startsWith(environment.apiUrl)
    ? url.href.slice(environment.apiUrl.length).split('?')[0]
    : url.pathname.replace(/^\/+/, '');

  const result = resolve(req, apiPath, url.searchParams);
  const response$: Observable<HttpResponse<unknown>> =
    result.status < 400
      ? of(new HttpResponse({ status: result.status, body: result.body, url: req.url }))
      : throwError(
          () =>
            new HttpErrorResponse({
              status: result.status,
              statusText: 'Fixture error',
              error: result.body,
              url: req.url,
            }),
        );

  // Delay errors too, so failure states look the way they do against a real server.
  return response$.pipe(materialize(), delay(LATENCY_MS), dematerialize());
};

function resolve(
  req: HttpRequest<unknown>,
  apiPath: string,
  query: URLSearchParams,
): FixtureResult {
  for (const route of FIXTURE_ROUTES) {
    if (route.method !== req.method) continue;
    const params = match(route, apiPath);
    if (params) {
      return route.handle({ params, query, body: req.body, request: req });
    }
  }
  const message = `No fixture for ${req.method} ${apiPath}. Add one in src/app/core/fixtures.`;
  return fail(501, message, [message]);
}

function match(route: FixtureRoute, apiPath: string): Record<string, string> | null {
  const expected = route.path.split('/');
  const actual = apiPath.replace(/\/+$/, '').split('/');
  if (expected.length !== actual.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < expected.length; i++) {
    if (expected[i].startsWith(':')) {
      params[expected[i].slice(1)] = decodeURIComponent(actual[i]);
    } else if (expected[i].toLowerCase() !== actual[i].toLowerCase()) {
      return null;
    }
  }
  return params;
}
