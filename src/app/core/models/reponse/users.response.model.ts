
export interface UsersResponse {
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
}

export interface AppUser {
  userKey: string;
  fullName: string;
  email: string;
  department: string;
}
