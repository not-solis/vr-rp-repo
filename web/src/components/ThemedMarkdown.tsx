import Markdown, { Options } from 'react-markdown';
import './ThemedMarkdown.css';
import remarkGfm from 'remark-gfm';

export const ThemedMarkdown = (props: Options) => {
  return (
    <div className='markdown'>
      <Markdown remarkPlugins={[remarkGfm]} {...props} />
    </div>
  );
};
