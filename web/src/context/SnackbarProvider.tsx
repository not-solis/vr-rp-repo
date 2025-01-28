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
  /**
   * General purpose function to create an app-level snackbar.
   *
   * @see {@link createErrorSnackbar} for specific error handling
   *
   * @param props
   * @returns
   */
  createSnackbar: (props: SnackbarProps) => void;
  /**
   * Creates an error snackbar, handling specific error types sent from the server.
   *
   * @param err
   * @returns
   */
  createErrorSnackbar: (err: any) => void;
}

export const SnackbarContext = createContext<SnackbarContextData>({
  createSnackbar: () => {},
  createErrorSnackbar: () => {},
});

export const useSnackbar = () => {
  return useContext(SnackbarContext);
};
