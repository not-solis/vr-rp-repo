import { createContext, useContext } from 'react';

import { User } from '../model/User';

export interface AuthContextData {
  user?: User;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextData>({
  isAuthLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};
