import { createContext, useContext } from 'react';

export interface UserData {
  id?: string;
  username?: string;
  globalName?: string;
  avatar?: string;
}

export interface AuthContextData {
  userData?: UserData;
  setUserData: (userData: UserData) => void;
}

export const AuthContext = createContext<AuthContextData>({
  setUserData: () => {},
});
export const useAuth = () => {
  return useContext(AuthContext);
};
