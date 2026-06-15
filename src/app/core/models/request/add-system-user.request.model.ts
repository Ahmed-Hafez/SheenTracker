export interface AddSystemUserRequest {
  fullName: string;
  email: string;
  azureUserKey: string | null;
  department: number;
  teamLeadId: number;
  squadId: number;
  title: string;
  seniority: number;
}
