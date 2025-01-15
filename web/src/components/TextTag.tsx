import { Typography } from '@mui/material';
import './TextTag.css';

export const TextTag = (props: any) => {
  const { tag, interactive, variant, ...restProps } = props;
  return (
    <div
      className={`tag disabled-text-interaction${
        interactive ? ' interactable' : ''
      }`}
      {...restProps}
    >
      <Typography variant={variant ?? 'body2'}>{tag}</Typography>
    </div>
  );
};
