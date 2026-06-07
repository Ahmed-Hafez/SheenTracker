export interface AddSystemUserRequest {
  fullName: string;
  email: string;
  department: string;
  teamLeadId: string | null;
  scrumMasterId: string | null;
  productOwnerId: string | null;
  squadName: string;
  title: string;
} 
