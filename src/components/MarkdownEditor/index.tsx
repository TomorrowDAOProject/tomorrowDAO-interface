import React from 'react';
import MdEditor, { Plugins } from 'react-markdown-editor-lite';
import pinFileToIPFS from 'components/PinFileToIPFS';
import MarkdownPreview from './MarkdownPreview';
import 'react-markdown-editor-lite/lib/index.css';
import './index.css';

MdEditor.unuse(Plugins.Clear);
MdEditor.unuse(Plugins.FontUnderline);

interface IMarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  maxLen?: number;
  id?: string;
}

export default function MarkdownEditor({ value, onChange, maxLen, id }: IMarkdownEditorProps) {
  const handleEditorChange: MdEditor['props']['onChange'] = ({ text }) => {
    onChange?.(text.slice(0, maxLen));
  };

  const handleImageUpload: Required<MdEditor['props']>['onImageUpload'] = async (file: File) => {
    try {
      const uploadData = await pinFileToIPFS(file);
      return uploadData?.url ?? '';
    } catch (error) {
      console.log('uploadData error: ', error);
      return '';
    }
  };

  return (
    <MdEditor
      className="markdown-editor"
      placeholder="Describe the proposal"
      view={{
        menu: true,
        md: true,
        html: false,
      }}
      renderHTML={(text) => <MarkdownPreview text={text} />}
      value={value}
      onChange={handleEditorChange}
      onImageUpload={handleImageUpload}
      id={id}
    />
  );
}
export { MarkdownPreview };
