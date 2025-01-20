import { Chip, ChipProps, Typography, TypographyVariant } from '@mui/material';
import './TagChip.css';

// interface TextTagProps {
//   interactive: boolean;
//   typographyVariant: TypographyVariant;
// }

export const TagChip = (props: ChipProps) => {
  const { style = {}, ...restChipProps } = props;
  const { onClick, className } = restChipProps;
  return (
    // <div
    //   className={`tag disabled-text-interaction${
    //     interactive ? ' interactable' : ''
    //   }`}
    //   {...restProps}
    // >
    //   <Typography variant={variant ?? 'body2'}>{tag}</Typography>
    // </div>
    <Chip
      className={className + ' tag' + (onClick ? ' interactable' : '')}
      style={{
        backgroundColor: '#50326c',
        borderRadius: 7,
        height: 'auto',
        ...style,
      }}
      size='small'
      {...restChipProps}
    />
  );
};
