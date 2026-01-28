export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserInfo;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
