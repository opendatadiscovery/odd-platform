import React from 'react';
import { HIGHLIGHT_MARK_END, HIGHLIGHT_MARK_START } from 'lib/search/highlightMarkers';
import { sliceStringByWidth } from 'lib/helpers';
import * as S from './SearchHighlightsStyles';

interface HighlightedTextProps {
  /** a highlight string as the server returns it — verbatim text with the two sentinel marks around a match */
  text: string;
  /** window the text around the first match to this many pixels (long descriptions, SQL); omit to show it whole */
  maxWidth?: number;
  /** keep the author's line breaks and use a monospace face — for a query example's SQL */
  pre?: boolean;
}

/**
 * ST-12 (#1846) — renders a search-result highlight string SAFELY. The server marks a matched span with two
 * Unicode private-use code points (`lib/search/highlightMarkers`), never with HTML, and this component turns the
 * string into React nodes by SPLITTING on those marks: the matched spans become `<b>` elements, everything else a
 * text node. No HTML parser is involved, so a description that contains `<img src=…>` or a query that contains
 * `a<b` is shown literally instead of becoming markup. (The previous renderer parsed the string as HTML and, on
 * the shipped platform, a description carrying an `<img>` tag made every viewer's browser fetch its URL.)
 */
const HighlightedText: React.FC<HighlightedTextProps> = ({ text, maxWidth, pre }) => {
  const windowed = maxWidth ? sliceStringByWidth(text, maxWidth) : text;
  const nodes: React.ReactNode[] = [];
  let rest = windowed;
  let key = 0;
  while (rest.length > 0) {
    const start = rest.indexOf(HIGHLIGHT_MARK_START);
    if (start < 0) {
      nodes.push(rest);
      break;
    }
    const end = rest.indexOf(HIGHLIGHT_MARK_END, start + 1);
    if (end < 0) {
      // an unterminated mark cannot happen on the server side; render what is left as plain text
      nodes.push(rest.replace(HIGHLIGHT_MARK_START, ''));
      break;
    }
    if (start > 0) nodes.push(rest.slice(0, start));
    nodes.push(<b key={key}>{rest.slice(start + 1, end)}</b>);
    key += 1;
    rest = rest.slice(end + 1);
  }
  return (
    <S.HighlightText variant='body1' $pre={pre}>
      {nodes}
    </S.HighlightText>
  );
};

export default HighlightedText;
