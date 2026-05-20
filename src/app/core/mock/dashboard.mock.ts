import { DashboardResponse } from '../models/reponse/dashboard.response.model';

export const DASHBOARD_PROJECTS_KPIS_RESPONSE: DashboardResponse['projectsKpis'] = {
  fromDate: '2024-05-01',
  toDate: '2024-05-17',
  projectsCount: 5,
  totalHours: 120,
  projects: [
    {
      rank: 1,
      projectName: 'Project A',
      totalHours: 50,
      workItemsCount: 10,
    },
    {
      rank: 2,
      projectName: 'Project B',
      totalHours: 30,
      workItemsCount: 8,
    },
    {
      rank: 3,
      projectName: 'Project C',
      totalHours: 20,
      workItemsCount: 5,
    },
    {
      rank: 4,
      projectName: 'Project D',
      totalHours: 15,
      workItemsCount: 4,
    },
    {
      rank: 5,
      projectName: 'Project E',
      totalHours: 5,
      workItemsCount: 2,
    },
  ],
};
