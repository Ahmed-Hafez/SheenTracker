export interface ProjectsHours {
  fromDate: string;
  toDate: string;
  projectsCount: number;
  totalHours: number;
  projects: Project[];
}

export interface Project {
  rank: number;
  projectName: string;
  totalHours: number;
  workItemsCount: number;
}