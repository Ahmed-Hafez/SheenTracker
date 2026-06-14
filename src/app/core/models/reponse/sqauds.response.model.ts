import { SystemUser } from "./system-users.response.model";

export interface Squad {
  id: number;
  name: string;
  productOwnerId: number;
  productOwnerName: string;
  scrumMasterId: number;
  scrumMasterName: string;
  usersCount: number;
  description: string;
  users : SystemUser[]
}