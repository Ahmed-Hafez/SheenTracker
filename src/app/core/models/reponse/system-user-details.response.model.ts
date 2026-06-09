export interface SystemUserDetails {
  id: number;
  fullName: string;
  email: string;
  department: number;
  azureUserKey: string | null;
  seniority: string | null;
  teamLeadId: number | null;
  teamLeadName: string;
  scrumMasterId: number | null;
  scrumMasterName: string;
  productOwnerId: number | null;
  productOwnerName: string;
  squadName: string;
  title: string;
}
