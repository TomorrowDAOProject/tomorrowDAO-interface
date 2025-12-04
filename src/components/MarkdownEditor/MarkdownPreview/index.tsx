import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'react-markdown-editor-lite/lib/index.css';
import 'katex/dist/katex.min.css';
import './index.css';

interface IMarkdownPreviewProps {
  text: string;
}

export default function MarkdownPreview({ text }: IMarkdownPreviewProps) {
  return (
    <ReactMarkdown
      className="markdown-preview"
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {text}
    </ReactMarkdown>
  );
}
