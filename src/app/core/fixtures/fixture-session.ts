import { environment } from '../../../environments/environment';

export const FIXTURE_TOKEN = 'fixture-session';

/** The signed-in user the fixture session pretends to be. Roles come from `environment.fixtures.roles`. */
export function fixtureUser() {
  return {
    email: 'fixture.admin@sheentrack.test',
    fullName: 'Fixture Admin',
    roles: environment.fixtures?.roles ?? ['SuperAdmin'],
  };
}

/**
 * Bypasses the login screen: stores a fake token and user before the app routes, using the same
 * localStorage keys as `AuthService`. Runs on every start, so changing `fixtures.roles` takes effect
 * on reload. Only called from `provideFixtures()`.
 */
export function startFixtureSession(): void {
  localStorage.setItem('auth_token', FIXTURE_TOKEN);
  localStorage.setItem('auth_user_data', JSON.stringify(fixtureUser()));
}
