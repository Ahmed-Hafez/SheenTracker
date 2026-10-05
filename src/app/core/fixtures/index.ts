import { authFixtures } from './auth.fixtures';
import { azureUsersFixtures } from './azure-users.fixtures';
import { FixtureRoute } from './fixture.model';
import { quarterPlansFixtures } from './quarter-plans.fixtures';
import { settingsFixtures } from './settings.fixtures';

/** Every fake endpoint. A new feature adds its `<area>.fixtures.ts` here. */
export const FIXTURE_ROUTES: readonly FixtureRoute[] = [
  ...authFixtures,
  ...azureUsersFixtures,
  ...quarterPlansFixtures,
  ...settingsFixtures,
];
