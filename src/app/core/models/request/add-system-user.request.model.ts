export interface AddSystemUserRequest {
  fullName: string;
  email: string;
  phoneNumber: string | null;
  azureUserKey: string | null;
  department: number;
  teamLeadId: number;
  squadId: number;
  title: string;
  seniority: number;
}
