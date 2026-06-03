export interface TopPerformersResponse {
  fromDate: string;
  toDate: string;
  users: User[];
}

export interface User {
  rank: number;
  userKey: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  closedTasksCount: number;
  totalHours: number;
}
