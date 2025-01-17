export enum UserRole {
  User = 'User',
  Admin = 'Admin',
}

export interface User {
  id: string;
  name: string;
  imageUrl?: string;
  role: UserRole;
}
