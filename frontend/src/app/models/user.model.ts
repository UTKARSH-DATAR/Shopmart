// User model representing registered customers and admins
export interface User {
  id?: number;
  name?: string;
  contact?: string;
  username: string;
  password?: string;
  email?: string;
  role?: 'USER' | 'ADMIN' | string;
}

// Credentials payload used during login
export interface LoginRequest {
  username?: string; // Supports login by username
  email?: string;    // Or login by email
  password: string;
}
