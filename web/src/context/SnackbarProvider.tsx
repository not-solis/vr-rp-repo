import { AlertColor } from '@mui/material';
import { createContext, useContext } from 'react';

export interface SnackbarProps {
  title: string;
  content: string | string[];
  severity: AlertColor;
  autoHideDuration?: number;
  onClose?: () => void;
}

export interface SnackbarContextData {
  createSnackbar: (props: SnackbarProps) => void;
}

export const SnackbarContext = createContext<SnackbarContextData>({
  createSnackbar: () => {},
});

export const useSnackbar = () => {
  return useContext(SnackbarContext);
};
