import React, { type FC, type ReactNode, type CSSProperties, useEffect } from 'react';
import type { ContextStore } from '@uiw/react-md-editor';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Position } from 'unist';
import type { Element } from 'hast';
import type { TypographyVariant } from '@mui/material/styles';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AppTooltip from 'components/shared/elements/AppTooltip/AppTooltip';
import CopyButton from 'components/shared/elements/CopyButton/CopyButton';
import * as S from './Markdown.styles';

/**
 * Stored-XSS hardening for every Markdown render sink (GHSA-mf43-2636-9289).
 *
 * `@uiw/react-markdown-preview` enables raw HTML through `rehype-raw` (its `skipHtml` default) with
 * no sanitizer, so user-authored Markdown can inject `javascript:` links, `<iframe src=javascript:>`,
 * etc. The library appends its `rehype-raw` LAST (after any caller `rehypePlugins`), so a lone
 * `rehype-sanitize` passed via `rehypePlugins` would run BEFORE the raw HTML is parsed (a no-op). We
 * therefore append `rehype-sanitize` through the documented `pluginsFilter` hook, which fires on the
 * fully-assembled plugin list — so sanitize runs AFTER the library's `rehype-raw` (raw parsed, THEN
 * scrubbed) without re-declaring rehype-raw ourselves or touching `skipHtml`.
 *
 * The schema is an attribute-only widening of the GitHub-style `defaultSchema`: `<script>`,
 * `<iframe>`, event handlers and `javascript:`/`data:` URLs stay blocked, while `className`
 * (syntax highlighting from `rehype-prism-plus`) and the `data-code` copy-button decoration survive.
 */
const markdownSanitizeSchema: typeof defaultSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
    div: [...(defaultSchema.attributes?.div ?? []), 'dataCode'],
  },
};

// The tuple annotation keeps the [plugin, options] pair from widening to a plain array.
const markdownSanitizePlugin: [typeof rehypeSanitize, typeof markdownSanitizeSchema] = [
  rehypeSanitize,
  markdownSanitizeSchema,
];

// Append rehype-sanitize as the LAST rehype plugin (after the library's own rehype-raw) on every
// render sink, so user HTML is parsed and then scrubbed. remark plugins pass through untouched.
const markdownPluginsFilter: React.ComponentProps<
  typeof MDEditor.Markdown
>['pluginsFilter'] = (type, plugins) =>
  type === 'rehype' ? [...plugins, markdownSanitizePlugin] : plugins;

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

export interface ReactMarkdownProps {
  node: Element;
  children: ReactNode[];
  sourcePosition?: Position;
  index?: number;
  siblingCount?: number;
}

type MarkdownElementProps<HTMLElement> = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>,
  'ref'
> &
  ReactMarkdownProps;

type MarkdownCopyButtonProps = MarkdownElementProps<HTMLDivElement>;

const MarkdownCopyButton = ({ node, ...props }: MarkdownCopyButtonProps) => {
  const { t } = useTranslation();

  return (
    <div {...props} style={{ backgroundColor: 'transparent' }}>
      <CopyButton stringToCopy={node.properties?.dataCode as string} text={t('Copy')} />
    </div>
  );
};

type MarkdownTermLinkProps = MarkdownElementProps<HTMLAnchorElement>;

const TermLink = ({ title, children, node, ...props }: MarkdownTermLinkProps) => {
  // Harden TermLink for the sanitized pipeline: (1) rehype-sanitize strips a disallowed-scheme href
  // (e.g. javascript:) off the node, so node.properties.href may be absent — default to '' rather than
  // calling .includes on undefined (would throw); (2) render {children} rather than children[0] — an
  // auto-generated heading-permalink anchor can be left with no children after its icon is sanitized,
  // and children[0] threw on it (it also dropped multi-node link text).
  const href = (node.properties?.href as string | undefined) ?? '';

  if (!href.includes('terms')) {
    return (
      <a href={node.properties?.href as string} title={title} {...props}>
        {children}
      </a>
    );
  }

  return (
    <AppTooltip
      title={<MDEditor.Markdown source={title} pluginsFilter={markdownPluginsFilter} />}
      childSx={{ display: 'inline-block' }}
      type='termLink'
    >
      <S.TermLink href={href}>{children}</S.TermLink>
    </AppTooltip>
  );
};

type MarkdownPreviewProps = MarkdownElementProps<HTMLParagraphElement>;

const Preview =
  (variant?: TypographyVariant) =>
  ({ children, ...props }: MarkdownPreviewProps) =>
    !variant ? (
      <div {...props}>{children}</div>
    ) : (
      <Typography paragraph variant={variant} {...props}>
        {children}
      </Typography>
    );

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
      previewOptions={{
        wrapperElement,
        disableCopy,
        pluginsFilter: markdownPluginsFilter,
      }}
      onChange={onChange}
    />
  ) : (
    <MDEditor.Markdown
      source={value}
      style={{ width: '100%', backgroundColor: 'inherit' }}
      wrapperElement={wrapperElement}
      disableCopy={disableCopy}
      pluginsFilter={markdownPluginsFilter}
      components={{
        a: TermLink,
        div: MarkdownCopyButton,
        p: Preview(variant),
      }}
    />
  );
};

export default Markdown;
