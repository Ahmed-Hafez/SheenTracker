

interface AchievementTasks{
  workItemId: number;
  title: string;
  projectName: string;
  state: string;
  startedAt: string;
  completedAt: string;
  durationDays: number;
  workingDays: number;
  originalEstimateHours: number;
  completedWorkHours: number;
  hoursPerWorkingDay: number;
}

export interface AchievementResponse{
  userKey: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  fromDate: string;
  toDate: string;
  completedTasksCount: number;
  totalCompletedWorkHours: number;
  tasks:AchievementTasks[];
}