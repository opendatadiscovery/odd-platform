import React, { type FC } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface MarkdownProps {
  value: string;
  editor?: boolean;
  disableCopy?: boolean;
}

const Markdown: FC<MarkdownProps> = ({ value, editor = false, disableCopy = false }) => {
  const wrapperElement = { 'data-color-mode': 'light' } as {
    'data-color-mode'?: 'light' | 'dark';
  };

  return editor ? (
    <MDEditor
      value={value}
      preview='edit'
      previewOptions={{ wrapperElement, disableCopy }}
    />
  ) : (
    <MDEditor.Markdown
      source={value}
      style={{ width: '100%' }}
      wrapperElement={wrapperElement}
      disableCopy={disableCopy}
    />
  );
};

export default Markdown;
