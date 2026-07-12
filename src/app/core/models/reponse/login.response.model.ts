export interface LoginResponse {
  token: string;
  expiresAt: string;
  email: string;
  fullName: string;
  roles: string[];
}
