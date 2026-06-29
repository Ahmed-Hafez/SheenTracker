

export interface ProjectUtilizationItem{
    projectName:string,
    totalHours: number,
    totalWorkItems: number,
    topDeveloperName: string,
    topDeveloperKey:number,
    topDeveloperHours: number,
    activeTasks:number,
    resolvedTasks:number,
    closedTasks:number,
}

export interface ProjectUtilizationResponse{
  fromDate: string;
  toDate: string;
  totalProjects: number;
  projects: ProjectUtilizationItem[];
}