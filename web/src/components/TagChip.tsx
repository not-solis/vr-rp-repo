import { Chip, ChipProps, Typography, TypographyVariant } from '@mui/material';
import { ForwardedRef, forwardRef } from 'react';

import './TagChip.css';

// interface TextTagProps {
//   interactive: boolean;
//   typographyVariant: TypographyVariant;
// }

export const TagChip = forwardRef(
  (props: ChipProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { style = {}, className = '', ...restChipProps } = props;
    const { onClick } = restChipProps;
    return (
      <Chip
        className={'tag' + (onClick ? ' interactable ' : ' ') + className}
        style={{
          borderRadius: 7,
          ...style,
        }}
        size='small'
        color='default'
        ref={ref}
        {...restChipProps}
      />
    );
  },
);
