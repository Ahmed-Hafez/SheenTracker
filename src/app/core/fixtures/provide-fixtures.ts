import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Off by default: every normal build gets these empty exports, so no fixture or fake-login code
 * ships. The `fixtures` build configuration swaps this file for `provide-fixtures.enabled.ts`
 * (see `fileReplacements` in angular.json).
 */
export function provideFixtures(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}

export const FIXTURE_INTERCEPTORS: HttpInterceptorFn[] = [];
