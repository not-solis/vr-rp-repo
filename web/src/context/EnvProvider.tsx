import { createContext, useContext } from 'react';

export interface EnvContextData {
  serverBaseUrl: string;
  discordRedirectUrl: string;
  discordClientId: string;
}

export const EnvContext = createContext<EnvContextData>({
  serverBaseUrl: '',
  discordRedirectUrl: '',
  discordClientId: '',
});

export const useEnv = () => {
  return useContext(EnvContext);
};
