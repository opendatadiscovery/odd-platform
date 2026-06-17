import React from 'react';
import { render } from 'lib/tests/testHelpers';
import Markdown from 'components/shared/elements/Markdown/Markdown';

/**
 * CTRIB-020 / GHSA-mf43-2636-9289 — stored-XSS regression for the shared Markdown wrapper.
 *
 * The wrapper renders user-supplied Markdown through @uiw/react-markdown-preview, which injects
 * rehype-raw with NO rehype-sanitize. Probe both the framework-blocked vectors (defense-in-depth)
 * and the residual vectors PLT-023 flagged as unmeasured (the real exploitability question):
 *  - the TermLink "terms"-branch renders node.properties.href RAW (no uriTransformer / no {...props});
 *  - <iframe src=javascript:> and SVG event attributes are not neutralised by React/uriTransformer.
 *
 * Polarity (G-C9): assertions encode the SAFE post-fix outcome — RED on whichever vector the
 * unfixed component actually renders, GREEN once the wrapper sanitises (rehypeRaw THEN rehypeSanitize).
 */
const rawJsHrefs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('a'))
    .map(a => (a.getAttribute('href') || '').toLowerCase())
    // javascript:void(0) is react-markdown's safe neutralised placeholder, not an exploit
    .filter(h => h.startsWith('javascript:') && !h.includes('void(0)'));

describe('Markdown — stored-XSS hardening (GHSA-mf43-2636-9289)', () => {
  // --- residual / real-exploit vectors (the severity question) ---
  it('TermLink terms-branch must not render a raw javascript: href', () => {
    const { container } = render(
      <Markdown value={"[click](javascript:alert('terms'))"} />
    );
    expect(rawJsHrefs(container)).toHaveLength(0);
  });

  it('does not render an <iframe> with a javascript: src', () => {
    const { container } = render(
      <Markdown value={'<iframe src="javascript:alert(1)"></iframe>'} />
    );
    const src = container.querySelector('iframe')?.getAttribute('src') || '';
    expect(/^\s*javascript:/i.test(src)).toBe(false);
  });

  it('strips SVG event-handler attributes (onbegin)', () => {
    const { container } = render(
      <Markdown value={'<svg><animate onbegin="alert(1)" /></svg>'} />
    );
    expect(container.querySelector('[onbegin]')).toBeNull();
  });

  // --- framework-blocked vectors (kept as defense-in-depth; sanitize must also drop them) ---
  it('does not render a <script> element from raw HTML', () => {
    const { container } = render(
      <Markdown value={'<script>window.__xss = 1</script>'} />
    );
    expect(container.querySelector('script')).toBeNull();
  });

  it('strips event-handler attributes from raw HTML (no onerror)', () => {
    const { container } = render(
      <Markdown value={'<img src=x onerror="window.__xss = 1">'} />
    );
    expect(container.querySelector('[onerror]')).toBeNull();
  });

  // --- no-regression: a heading (auto-permalinked by the @uiw pipeline) + a link must render.
  //     The permalink anchor's icon is stripped by sanitize, leaving it childless; TermLink must
  //     not crash on that (regression guard for the IT-099 blank-page crash). ---
  it('renders headings (auto-permalinked) and links without crashing', () => {
    const { container } = render(
      <Markdown value={'## My Heading\n\nSee [the label](https://example.com/page).'} />
    );
    expect(container.textContent).toContain('My Heading');
    expect(container.querySelector('a[href="https://example.com/page"]')).not.toBeNull();
    expect(container.textContent).toContain('the label');
  });

  // --- no-regression: legitimate Markdown must survive sanitization ---
  it('still renders legitimate Markdown (bold, https link, inline code)', () => {
    const { container } = render(
      <Markdown value={'**bold** and [safe](https://example.com) with `inline`'} />
    );
    expect(container.querySelector('strong')?.textContent).toContain('bold');
    expect(container.querySelector('a[href="https://example.com"]')).not.toBeNull();
    expect(container.querySelector('code')?.textContent).toContain('inline');
  });
});
