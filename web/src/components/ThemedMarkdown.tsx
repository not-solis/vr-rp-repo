import Markdown, { Options } from 'react-markdown';
import './ThemedMarkdown.css';
import { Typography } from '@mui/material';

export const ThemedMarkdown = (props: Options) => {
  return (
    <div className='markdown'>
      <Markdown {...props} />
    </div>
  );
};
