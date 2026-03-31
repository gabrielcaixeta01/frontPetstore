export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role: string;
  user_active: boolean;
}

export interface CreateUserDTO {
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  user_active?: boolean;
}

export interface UpdateUserDTO {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  user_active?: boolean;
}