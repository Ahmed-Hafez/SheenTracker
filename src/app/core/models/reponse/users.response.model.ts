export interface UsersResponse { 
  userKpis: UsersKpis;
  users: User[];
}

export interface UsersKpis {
  fromDate: string;
  toDate: string;
  totalUsers: number;
  usersWithHours: number;
  totalHours: number;
}

export interface User {
  userKey: string;
  displayName: string;
  email: string;
  principalName: string;
  descriptor: string;
  avatarUrl?: string;
  totalHours: number;
  projectsCount: number;
  workItemsCount: number;
  projectNames: string[];
}
