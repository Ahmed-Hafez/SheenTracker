import { UsersKpis } from './users.response.model';

export interface DashboardResponse {
  usersKpis: UsersKpis;
  projectsKpis: projectsKpis;
  topUsers: TopUser[];
}

interface projectsKpis {
  fromDate: string;
  toDate: string;
  projectsCount: number;
  totalHours: number;
  projects: project[];
}

interface project {
  rank: number;
  projectName: string;
  totalHours: number;
  workItemsCount: number;
}

export interface TopUser {
  displayName: string;
  totalHours: number;
}
