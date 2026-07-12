export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
