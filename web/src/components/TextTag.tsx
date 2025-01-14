import { Box } from '@mui/material';
import './TextTag.css';

export const TextTag = (props: any) => {
  const { tag, interactive, ...restProps } = props;
  return (
    <Box
      key={tag}
      className={`tag disabled-text-interaction${
        interactive ? ' interactable' : ''
      }`}
      {...restProps}
    >
      {tag}
    </Box>
  );
};
