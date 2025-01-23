import { createContext, useContext } from 'react';

import { User, UserRole } from '../model/User';

export interface AuthContextData {
  user?: User;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (role?: UserRole) => boolean;
}

export const AuthContext = createContext<AuthContextData>({
  isAuthLoading: true,
  isAuthenticated: false,
  hasPermission: () => false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};
