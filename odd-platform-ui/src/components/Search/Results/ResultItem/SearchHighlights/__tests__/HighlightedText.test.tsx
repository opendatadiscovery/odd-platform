import React from 'react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import { render } from 'lib/tests/testHelpers';
import { HIGHLIGHT_MARK_END, HIGHLIGHT_MARK_START } from 'lib/search/highlightMarkers';
import HighlightedText from '../HighlightedText';

/**
 * ST-12 (#1846) — the safe renderer of a search-result highlight string. The server marks a matched span with two
 * private-use code points; this component SPLITS on them: the span becomes a <b>, everything else a text node.
 * The negative case is the one that shipped broken: with the previous HTML parser a description carrying
 * `<img src=…>` created a real image (the browser fetched its URL) and `a<b` swallowed the text after it.
 */

const mark = (word: string) => `${HIGHLIGHT_MARK_START}${word}${HIGHLIGHT_MARK_END}`;

const renderText = (props: React.ComponentProps<typeof HighlightedText>) =>
  render(
    <MuiThemeProvider theme={theme}>
      <HighlightedText {...props} />
    </MuiThemeProvider>
  );

describe('HighlightedText (ST-12 / #1846)', () => {
  it('renders each marked span as a <b> and the rest as text', () => {
    const { container } = renderText({
      text: `rows of ${mark('shipped')} and ${mark('orders')}`,
    });
    const bolds = container.querySelectorAll('b');
    expect(bolds).toHaveLength(2);
    expect(bolds[0].textContent).toBe('shipped');
    expect(bolds[1].textContent).toBe('orders');
    expect(container.textContent).toBe('rows of shipped and orders');
    expect(container.textContent).not.toContain(HIGHLIGHT_MARK_START);
  });

  it('shows markup and angle brackets LITERALLY — no element is ever created from the text', () => {
    const text = `cost<budget and ${mark('budgetw')} <img src="/nope"> <script>x()</script> <a href="javascript:void(0)">x</a> a<b`;
    const { container } = renderText({ text });
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('cost<budget and budgetw <img src="/nope">');
    expect(container.textContent).toContain('a<b');
    expect(container.querySelectorAll('b')).toHaveLength(1);
  });

  it('a literal <b> in the text is text, not a mark', () => {
    const { container } = renderText({ text: 'this <b>is not</b> bold' });
    expect(container.querySelectorAll('b')).toHaveLength(0);
    expect(container.textContent).toBe('this <b>is not</b> bold');
  });

  it('an unterminated mark degrades to plain text (never throws)', () => {
    const { container } = renderText({ text: `half ${HIGHLIGHT_MARK_START}open` });
    expect(container.querySelectorAll('b')).toHaveLength(0);
    expect(container.textContent).toBe('half open');
  });

  it('the pre variant keeps the author line breaks (SQL)', () => {
    const { container } = renderText({
      text: `select *\nfrom ${mark('orders')}\nwhere a<b`,
      pre: true,
    });
    expect(container.textContent).toBe('select *\nfrom orders\nwhere a<b');
    expect(container.querySelector('b')?.textContent).toBe('orders');
  });
});
