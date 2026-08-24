import { BacklogItemApiModel } from "../../../core/models/reponse/backlog-response.model";

export interface BacklogItemUIModel {
  data: BacklogItemApiModel;
  color?: string;
  levelNumber: number;
  icon?: string;
}
