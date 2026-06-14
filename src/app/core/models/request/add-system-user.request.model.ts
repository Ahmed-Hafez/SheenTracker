export interface AddSystemUserRequest {
  fullName: string;
  email: string;
  department: number;
  teamLeadId: number;
  squadId: number;
  title: string;
  seniority: number;
  azureUserKey: string | null;
}
