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
  childrenOfFeaturesCount: number;
  executionNewCount: number;
  executionActiveCount: number;
  executionClosedCount: number;
  unlinkedEpicsCount: number;
  unlinkedFeaturesCount: number;
  tasksCount: number;
  totalEffort: number;
  totalStoryPoints: number;
  totalCompleted: number;
  totalRemaining: number;
  closedEffort: number;
  closedStoryPoints: number;
  completionPercentEffort: number;
  completionPercentSP: number;
}
