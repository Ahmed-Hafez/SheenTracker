import { LoginResponse } from '../models/reponse/login.response.model';
import { FixtureRoute } from './fixture.model';
import { FIXTURE_TOKEN, fixtureUser } from './fixture-session';

/** After a logout, any email and password signs back in as the fixture user. */
export const authFixtures: FixtureRoute[] = [
  {
    method: 'POST',
    path: 'auth/login',
    handle: () => {
      const response: LoginResponse = {
        ...fixtureUser(),
        token: FIXTURE_TOKEN,
        expiresAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
      };
      // The login endpoint returns the response bare, without the ApiResponse envelope.
      return { status: 200, body: response };
    },
  },
];
