export interface EnvironmentInterface {
  production: boolean;
  apiUrl: string;
  version: string;
  /** Fixture mode only: skip the login and answer API calls from `src/app/core/fixtures`. */
  fixtures?: {
    /** Roles of the fake signed-in user. */
    roles: string[];
  };
}
