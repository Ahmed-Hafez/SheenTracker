import { Achievements } from './user-achievemets.model';
import { WorkItems } from './user-workItems.model';

export interface AzureUserDetail {
  azureUserKey: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  isLinked: boolean;
  achievements: Achievements;
  workItems: WorkItems;
}


