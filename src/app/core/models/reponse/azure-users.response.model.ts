import { Department } from "../../enums/departments.enum";

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
  teamLead: string;
  department: Department;
  principalName: string;
  descriptor: string;
  avatarUrl?: string;
  totalHours: number;
  expectedHours: number | null;
  projectsCount: number;
  workItemsCount: number;
  projectNames: string[];
  projectHoursMap: { [key: string]: number };
  productOwnerNames: string[];
  scrumMasterNames: string[];
}
