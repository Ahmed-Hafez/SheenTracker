import { PlanQuarter } from './plan-quarter.response';

export interface QuarterPlansDashboardResponse {
  /** The quarter these numbers belong to, or `null` when no quarter filter applied. */
  quarter?: PlanQuarter | null;

  epicsCount: number;
  featuresCount: number;
  /** `User Story` type only. Use totalStoriesCount for "Stories". */
  storiesCount: number;
  /** storiesCount + techStoryCount. Optional until the backend change is deployed. */
  totalStoriesCount?: number;
  bugsCount: number;
  testCaseCount: number;
  meetingsCount: number;
  techStoryCount: number;
  supportCount: number;
  threadCount: number;
  tasksCount: number;

  childrenOfFeaturesCount: number;
  /** Task/Bug/Thread/Support items under a Story. Equals executionNew + executionActive + executionClosed. Optional until the backend change is deployed. */
  totalChildrenCount?: number;

  executionNewCount: number;
  executionActiveCount: number;
  executionClosedCount: number;
  /** executionClosedCount / totalChildrenCount * 100, unrounded (0–100). */
  executionCompletionPercent?: number;

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
