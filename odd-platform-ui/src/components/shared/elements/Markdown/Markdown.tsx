import React, { type FC, type ReactNode } from 'react';
import MDEditor from '@uiw/react-md-editor';
import CopyButton from 'components/shared/elements/CopyButton/CopyButton';
import type { Position } from 'unist';
import type { Element } from 'hast';

interface MarkdownProps {
  value: string;
  editor?: boolean;
  disableCopy?: boolean;
}

export type ReactMarkdownProps = {
  node: Element;
  children: ReactNode[];
  sourcePosition?: Position;
  index?: number;
  siblingCount?: number;
};

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
