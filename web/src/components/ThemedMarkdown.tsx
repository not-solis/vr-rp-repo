import Markdown, { Options } from 'react-markdown';
import './ThemedMarkdown.css';

export const ThemedMarkdown = (props: Options) => {
  return (
    <div className='markdown'>
      <Markdown {...props} />
    </div>
  );
};
