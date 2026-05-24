
export interface DashboardResponse {
  dashboardUsers: DashboardUser;
  projectsKpis: project[];
}

export interface projectsKpis {
  fromDate: string;
  toDate: string;
  projectsCount: number;
  totalHours: number;
  projects: project[];
}

export interface DashboardUser { 
  userKpis: UsersKpis;
  topUsers: TopUser[];
}

export interface UsersKpis {
  totalUsers: number;
  usersWithHours: number;
  totalHours: number;
}

export interface project {
  rank: number;
  projectName: string;
  totalHours: number;
  workItemsCount: number;
}

export interface TopUser {
  displayName: string;
  totalHours: number;
}
