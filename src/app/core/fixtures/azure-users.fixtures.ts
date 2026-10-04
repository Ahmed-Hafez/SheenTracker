import { Department } from '../enums/departments.enum';
import { User } from '../models/reponse/azure-users.response.model';
import { FixtureRoute } from './fixture.model';

/** ~70 Azure DevOps identities: people, plus a few service identities the exclusions are meant to hide. */
const DEPARTMENTS = [
  Department.Backend,
  Department.Frontend,
  Department.QualityAssurance,
  Department.DevOps,
  Department.HumanResources,
  Department.ProductManagement,
];

const people: User[] = Array.from({ length: 60 }, (_, i) =>
  user(
    `Employee ${String(i + 1).padStart(2, '0')}`,
    DEPARTMENTS[i % DEPARTMENTS.length],
    40 + (i % 9) * 11,
  ),
);
const services: User[] = [
  user('Build Bot', Department.DevOps, 0),
  user('Project Collection Build Service (Sheen)', Department.DevOps, 0),
  user('Release Pipeline', Department.DevOps, 0),
  user('Test Runner', Department.QualityAssurance, 0),
];
const all = [...people, ...services];

export const azureUsersFixtures: FixtureRoute[] = [
  {
    method: 'GET',
    path: 'AzureDevOps/users',
    handle: () =>
      // This endpoint returns its payload bare, without the ApiResponse envelope.
      ({
        status: 200,
        body: {
          totalUsers: all.length,
          usersWithHours: all.filter((u) => u.totalHours > 0).length,
          totalHours: all.reduce((n, u) => n + u.totalHours, 0),
          users: all,
        },
      }),
  },
];

function user(displayName: string, department: Department, totalHours: number): User {
  const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '.');
  return {
    userKey: slug,
    displayName,
    email: `${slug}@sheentrack.test`,
    teamLead: 'Employee 01',
    department,
    principalName: `${slug}@sheentrack.test`,
    descriptor: `aad.${slug}`,
    totalHours,
    expectedHours: totalHours ? 160 : null,
    numOfRemovedHours: totalHours ? 0 : 0,
    projectsCount: totalHours ? 2 : 0,
    workItemsCount: totalHours ? 12 : 0,
    projectNames: totalHours ? ['Atlas', 'Beacon'] : [],
    projectHoursMap: {},
    productOwnerNames: [],
    scrumMasterNames: [],
  };
}
