export interface SystemUser {
  id: number;
  fullName: string;
  email: string;
  department: number | string;
  azureUserKey: string | null;
  teamLeadId: number | null;
  teamLeadName: string;
  scrumMasterId: number | null;
  scrumMasterName: string;
  productOwnerId: number | null;
  productOwnerName: string;
  squad: number | string;
  seniority: number | string;
}

export interface SystemUserBySeniority {
  scrumMasters: SystemUser[];
  teamLeads: SystemUser[]
  productOwners: SystemUser[]
 }
