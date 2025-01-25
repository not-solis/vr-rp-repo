import { createContext, useContext } from 'react';

export interface EnvContextData {
  serverBaseUrl: string;
  discordRedirectPath: string;
  discordClientId: string;
  maxImageSize: number;
}

export const EnvContext = createContext<EnvContextData>({
  serverBaseUrl: '',
  discordRedirectPath: '',
  discordClientId: '',
  maxImageSize: 0,
});

export const useEnv = () => {
  return useContext(EnvContext);
};
