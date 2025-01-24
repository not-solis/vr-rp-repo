import { createContext, useContext } from 'react';

export interface EnvContextData {
  serverBaseUrl: string;
  discordRedirectPath: string;
  discordClientId: string;
}

export const EnvContext = createContext<EnvContextData>({
  serverBaseUrl: '',
  discordRedirectPath: '',
  discordClientId: '',
});

export const useEnv = () => {
  return useContext(EnvContext);
};
