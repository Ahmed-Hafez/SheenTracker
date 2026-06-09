export interface SystemUser {
  id: number;
  fullName: string;
  email: string;
  department: number;
  azureUserKey: string | null;
  teamLeadId: number | null;
  teamLeadName: string | null;
  scrumMasterId: number | null;
  scrumMasterName: string | null;
  productOwnerId: number | null;
  productOwnerName: string | null;
  squad: number;
  seniority: number;
  title: string;
}
