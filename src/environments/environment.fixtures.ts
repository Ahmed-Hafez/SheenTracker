import { EnvironmentInterface } from './environment.interface';

/** `npm run start:fixtures`: no backend and no login. Change `roles` to test other role views. */
export const environment: EnvironmentInterface = {
  production: false,
  apiUrl: 'https://fixtures.local/api/',
  version: '1.0.0',
  fixtures: {
    roles: ['SuperAdmin'],
  },
};
