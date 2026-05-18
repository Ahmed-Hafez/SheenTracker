export interface UserDetail {
  key: string;
  displayName: string;
  email: string;
  principalName: string;
  descriptor: string;
  avatarUrl: string;
}

export interface WorkItemDetail {
  id: number;
  title: string;
  state: string;
  assignedTo: string;
  previousCompletedWork: number;
  currentCompletedWork: number;
  deltaHours: number;
}

export interface ProjectDetail {
  projectName: string;
  hours: number;
  workItems: WorkItemDetail[];
}

export interface UserDetailsResponse {
  user: UserDetail;
  fromDate: string;
  toDate: string;
  totalHours: number;
  projectsCount: number;
  workItemsCount: number;
  projects: ProjectDetail[];
}
