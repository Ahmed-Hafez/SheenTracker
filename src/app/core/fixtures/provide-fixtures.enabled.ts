import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { startFixtureSession } from './fixture-session';
import { fixtureInterceptor } from './fixture.interceptor';

/**
 * Fixture mode (`npm run start:fixtures`) skips the login and serves the API from
 * `src/app/core/fixtures`. Only the `fixtures` build configuration uses this file; it replaces
 * `provide-fixtures.ts`, so no other build contains any fixture code.
 */
export function provideFixtures(): EnvironmentProviders {
  return makeEnvironmentProviders([provideAppInitializer(startFixtureSession)]);
}

/** Goes last in `withInterceptors`, so the auth and error interceptors still run around it. */
export const FIXTURE_INTERCEPTORS: HttpInterceptorFn[] = [fixtureInterceptor];
