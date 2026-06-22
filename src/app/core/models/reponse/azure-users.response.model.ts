export interface AzureUsers {
  totalUsers: number;
  usersWithHours: number;
  totalHours: number;
  users: User[];
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
  projectHoursMap: { [key: string]: number };
}
