export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  user_type: string;
  email_verified?: boolean;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  passwordConfirm: string;
}