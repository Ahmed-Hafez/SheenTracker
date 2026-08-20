

export interface BacklogItemApiModel {
  id: number;
  title: string;
  type: string;
  state: string;
  effort: number;
  completedWork: number;
  remainingWork: number;
  healthStatus: string;
  children: BacklogItemApiModel[];
}
export interface AllEpicsResponse {
  items: BacklogItemApiModel[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}