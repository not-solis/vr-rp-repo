import { TextField, TextFieldProps } from '@mui/material';
import { KeyboardEvent as ReactKeyboardEvent } from 'react';

export const BlurrableTextField = (props: TextFieldProps) => {
  const handleEnter = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      const inputElement = event.currentTarget.getElementsByTagName('input')[0];
      inputElement.blur();
    }
  };
  return <TextField onKeyDown={handleEnter} {...props} />;
};
