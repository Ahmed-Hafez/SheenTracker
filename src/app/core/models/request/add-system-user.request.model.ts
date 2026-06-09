export interface AddSystemUserRequest {
  fullName: string;
  email: string;
  department: number;
  teamLeadId: number | null;
  squad: number;
  title: string;
} 
