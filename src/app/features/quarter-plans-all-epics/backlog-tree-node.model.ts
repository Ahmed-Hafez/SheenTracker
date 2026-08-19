import { BacklogItemApiModel } from '../../core/mock/all-epics.mock';

export interface BacklogItemUIModel {
  data: BacklogItemApiModel;
  color?: string;
  levelNumber: number;
  icon?: string;
}
