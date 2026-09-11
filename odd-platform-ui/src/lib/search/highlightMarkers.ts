/**
 * The marks a search-result highlight carries around a matched span (ST-12 / #1846).
 *
 * `GET /api/search/assets/{asset_kind}/{asset_id}/highlights` returns every field as the asset's VERBATIM text
 * with the matched spans delimited by two Unicode private-use code points — never as HTML. This is the ONE
 * definition of that pair on the client; the server's is `FTSConstants.HIGHLIGHT_MARK_START / _END` (the
 * `ts_headline` StartSel / StopSel), and the two MUST agree or nothing is marked. The text between the marks is
 * rendered as a `<b>` element by `HighlightedText`; everything else is rendered as a text node, so a description
 * that contains `<img src=…>` or a query that contains `a<b` is shown literally instead of becoming markup.
 */
export const HIGHLIGHT_MARK_START = '';
export const HIGHLIGHT_MARK_END = '';

/** A key for a per-asset highlight in the redux map: the polymorphic (kind, id) pair, ids collide across kinds. */
export const highlightKey = (assetKind: string, assetId: number): string =>
  `${assetKind}:${assetId}`;
