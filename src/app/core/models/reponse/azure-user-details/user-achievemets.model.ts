

interface AchievementTasks {
  workItemId: number;
  title: string;
  projectName: string;
  state: string;
  workItemType: string;
  startedAt: string;
  completedAt: string;
  durationDays: number;
  workingDays: number;
  originalEstimateHours: number;
  completedWorkHours: number;
  hoursPerWorkingDay: number;
}

export interface Achievements{
  completedTasksCount: number;
  totalCompletedWorkHours: number;
  tasks:AchievementTasks[];
}
