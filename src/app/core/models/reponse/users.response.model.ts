export interface UsersResponse {
  fromDate: string;
  toDate: string;
  totalUsers: number;
  usersWithHours: number;
  totalHours: number;
  users: User[];
}

interface User {
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
