import React, { type FC } from 'react';
import MDEditor from '@uiw/react-md-editor';
import type { ReactMarkdownProps } from 'react-markdown/lib/ast-to-react';
import CopyButton from 'components/shared/CopyButton/CopyButton';

interface MarkdownProps {
  value: string;
  editor?: boolean;
  disableCopy?: boolean;
}

type MarkdownCopyButtonProps = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'ref'
> &
  ReactMarkdownProps;

const MarkdownCopyButton = ({ node, ...props }: MarkdownCopyButtonProps) => (
  <div {...props} style={{ backgroundColor: 'transparent' }}>
    <CopyButton stringToCopy={node.properties?.dataCode as string} text='Copy' />
  </div>
);

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
      components={{ div: MarkdownCopyButton }}
    />
  );
};

export default Markdown;
