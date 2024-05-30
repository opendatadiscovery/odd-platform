import React, { type FC, type ReactNode, type CSSProperties, useEffect } from 'react';
import type { ContextStore } from '@uiw/react-md-editor';
import MDEditor from '@uiw/react-md-editor';
import type { Position } from 'unist';
import type { Element } from 'hast';
import type { TypographyVariant } from '@mui/material/styles';
import { Typography } from '@mui/material';
import AppTooltip from 'components/shared/elements/AppTooltip/AppTooltip';
import CopyButton from 'components/shared/elements/CopyButton/CopyButton';
import * as S from './Markdown.styles';

interface MarkdownProps {
  value: string;
  editor?: boolean;
  disableCopy?: boolean;
  onChange?: (
    value?: string | undefined,
    event?: React.ChangeEvent<HTMLTextAreaElement> | undefined,
    state?: ContextStore | undefined
  ) => void;
  height?: CSSProperties['height'];
  variant?: TypographyVariant;
}

export type ReactMarkdownProps = {
  node: Element;
  children: ReactNode[];
  sourcePosition?: Position;
  index?: number;
  siblingCount?: number;
};

type MarkdownElementProps<HTMLElement> = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>,
  'ref'
> &
  ReactMarkdownProps;

type MarkdownCopyButtonProps = MarkdownElementProps<HTMLDivElement>;

const MarkdownCopyButton = ({ node, ...props }: MarkdownCopyButtonProps) => (
  <div {...props} style={{ backgroundColor: 'transparent' }}>
    <CopyButton stringToCopy={node.properties?.dataCode as string} text='Copy' />
  </div>
);

type MarkdownTermLinkProps = MarkdownElementProps<HTMLAnchorElement>;

const TermLink = ({ title, children, node, ...props }: MarkdownTermLinkProps) => {
  const href = node.properties?.href as string;

  if (!href.includes('terms')) {
    return (
      <a href={node.properties?.href as string} title={title} {...props}>
        {children[0]}
      </a>
    );
  }

  return (
    <AppTooltip
      title={<MDEditor.Markdown source={title} />}
      childSx={{ display: 'inline-block' }}
      type='termLink'
    >
      <S.TermLink href={href}>{children[0]}</S.TermLink>
    </AppTooltip>
  );
};

type MarkdownPreviewProps = MarkdownElementProps<HTMLParagraphElement>;

const Preview =
  (variant?: TypographyVariant) =>
  ({ ...props }: MarkdownPreviewProps) =>
    !variant ? <div {...props} /> : <Typography paragraph variant={variant} {...props} />;

const Markdown: FC<MarkdownProps> = ({
  value,
  editor = false,
  disableCopy = false,
  onChange,
  height,
  variant,
}) => {
  const wrapperElement = { 'data-color-mode': 'light' } as {
    'data-color-mode'?: 'light' | 'dark';
  };

  useEffect(() => {
    document
      .getElementById('md-editor')
      ?.querySelector('textarea')
      ?.setAttribute('spellcheck', 'true');
  }, []);

  return editor ? (
    <MDEditor
      id='md-editor'
      height={height}
      value={value}
      preview='edit'
      previewOptions={{ wrapperElement, disableCopy }}
      onChange={onChange}
    />
  ) : (
    <MDEditor.Markdown
      source={value}
      style={{ width: '100%', backgroundColor: 'inherit' }}
      wrapperElement={wrapperElement}
      disableCopy={disableCopy}
      components={{
        a: TermLink,
        div: MarkdownCopyButton,
        p: Preview(variant),
      }}
    />
  );
};

export default Markdown;
