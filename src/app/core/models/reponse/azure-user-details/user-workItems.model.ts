export interface WorkItems {
  totalHours: number;
  projectsCount: number;
  workItemsCount: number;
  projects: ProjectDetail[];
}

export interface ProjectDetail {
  projectName: string;
  hours: number;
  workItems: WorkItemDetail[];
}

export interface WorkItemDetail {
  id: number;
  title: string;
  state: string;
  workItemType: string;
  assignedTo: string;
  previousCompletedWork: number;
  currentCompletedWork: number;
  deltaHours: number;
}

