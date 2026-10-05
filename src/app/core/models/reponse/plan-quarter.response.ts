/** One Azure DevOps planning quarter, from `GET dashboard/quarters`. Dates are `YYYY-MM-DD`. */
export interface PlanQuarter {
  /** Value sent as the `quarter` query parameter, e.g. `2026_Q3`. */
  name: string;
  iterationPath: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}
