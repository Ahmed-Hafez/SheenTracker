export interface QuarterPlansDashboardResponse {
  epicsCount: number;
  featuresCount: number;
  storiesCount: number;
  bugsCount: number;
  testCaseCount: number;
  meetingsCount: number;
  techStoryCount: number;
  supportCount: number;
  threadCount: number;
  tasksCount: number;

  childrenOfFeaturesCount: number;

  executionNewCount: number;
  executionActiveCount: number;
  executionClosedCount: number;

  unlinkedEpicsCount: number;
  unlinkedFeaturesCount: number;

  totalEffort: number;
  totalStoryPoints: number;
  totalCompleted: number;
  totalRemaining: number;

  closedEffort: number;
  closedStoryPoints: number;

  completionPercentEffort: number;
  completionPercentSP: number;

  epicsByArea: EpicsByArea[];
  epicsByTaskType: EpicsByTaskType[];
}

export interface EpicsByArea {
  area: string;
  total: number;
  notStarted: number;
  inProgress: number;
  closed: number;
  completionPercent: number;
}

export interface EpicsByTaskType {
  taskType: string;
  total: number;
  notStarted: number;
  inProgress: number;
  closed: number;
  completionPercent: number;
}
