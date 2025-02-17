export enum UserRole {
  Admin = 'Admin',
  User = 'User',
  Banned = 'Banned',
}

export interface User {
  id: string;
  name: string;
  imageUrl?: string;
  role: UserRole;
  email: string;
  discordId?: string;
  googleId?: string;
  twitchId?: string;
}
