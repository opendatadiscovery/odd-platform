import React from 'react';
import { getByText, queryByText, queryByTestId, render } from 'lib/tests/testHelpers';
import SearchResultsHeader from '../SearchResultsHeader';

/**
 * ST-8 (#1842) — the results header is the ONLY place `/search` shows a match count since the tab strip
 * was retired, and it is the surface that tells an operator whether that count can be trusted.
 *
 * The claim under test is a governance claim, not a cosmetic one. The My-data lineage scope is bounded, so
 * a result can be a strict subset of the true scope; an operator who reads "17 downstream consumers" off a
 * partial set and concludes they have warned everyone has been misled by this component. So every case
 * below asserts the QUALIFIER, not just the number.
 *
 * Written because the truncation state previously had NO automated coverage at any level — it had been
 * exercised once by hand with the response intercepted at the network boundary, which no regression can
 * re-run. An edit that dropped `scopeTruncated` from the thunk mapping (the same mapping that was already
 * discarding `total` before this slice) would have shipped a partial impact set rendered as complete.
 */
describe('SearchResultsHeader — the match count and whether it can be trusted (ST-8 / #1842)', () => {
  it('renders a plain total when nothing was truncated', () => {
    render(<SearchResultsHeader total={42} isLoading={false} />);
    expect(getByText('42 results')).toBeTruthy();
    expect(queryByTestId('search-scope-truncated')).toBeNull();
  });

  it('says "0 results" on an empty search — an empty list alone reads as a loading failure', () => {
    render(<SearchResultsHeader total={0} isLoading={false} />);
    expect(getByText('0 results')).toBeTruthy();
  });

  it('renders the singular for exactly one match, not "1 results"', () => {
    render(<SearchResultsHeader total={1} isLoading={false} />);
    expect(getByText('1 result')).toBeTruthy();
    expect(queryByText('1 results')).toBeNull();
  });

  it('suppresses the count while the first page is loading, so no number is asserted before one exists', () => {
    render(<SearchResultsHeader total={0} isLoading />);
    expect(queryByTestId('search-results-count')).toBeNull();
  });

  it('NODE_CAP: qualifies the count as partial AND shows the persistent strip', () => {
    render(
      <SearchResultsHeader
        total={1240}
        isLoading={false}
        scopeTruncated
        scopeTruncationReason='NODE_CAP'
      />
    );
    expect(getByText('1240+ results (partial)')).toBeTruthy();
    expect(queryByText('1240 results')).toBeNull();
    expect(queryByTestId('search-scope-truncated')).toBeTruthy();
  });

  // The regression this case exists for: TIMEOUT used to be EXCLUDED from the qualifier, so the header
  // printed a bare "0 results" beside a warning strip. That is the exact false-complete claim the component
  // exists to prevent -- "Downstream of my data -> 0 results" reads as "nothing depends on my assets". On
  // TIMEOUT the lineage directions contribute no rows at all, so the true set is a strict SUPERSET of what
  // is shown and `N+` is the honest marker, exactly as it is for NODE_CAP.
  it('TIMEOUT: never prints a bare total — the count is qualified like any other truncation', () => {
    render(
      <SearchResultsHeader
        total={0}
        isLoading={false}
        scopeTruncated
        scopeTruncationReason='TIMEOUT'
      />
    );
    expect(getByText('0+ results (partial)')).toBeTruthy();
    expect(queryByText('0 results')).toBeNull();
    expect(queryByTestId('search-scope-truncated')).toBeTruthy();
  });

  it('TIMEOUT: the strip says the results are MISSING, not that the scope was skipped', () => {
    render(
      <SearchResultsHeader
        total={0}
        isLoading={false}
        scopeTruncated
        scopeTruncationReason='TIMEOUT'
      />
    );
    // The scope IS applied on timeout -- the lineage half resolves to "matches nothing" -- so copy claiming
    // it "was not applied" would send the reader looking for an unfiltered catalog they are not being shown.
    expect(
      getByText(
        'Your My data lineage scope could not be resolved in time, so its results are missing from this list. Reduce the depth or narrow your filters.'
      )
    ).toBeTruthy();
  });

  it('NODE_CAP and TIMEOUT carry DIFFERENT remedies — the reader must know which bound bit', () => {
    const { unmount } = render(
      <SearchResultsHeader
        total={5}
        isLoading={false}
        scopeTruncated
        scopeTruncationReason='NODE_CAP'
      />
    );
    expect(
      getByText(
        'Only part of your My data lineage scope was searched. Reduce the depth or add filters for a complete set, or open an asset in the Lineage view for its full blast radius.'
      )
    ).toBeTruthy();
    unmount();

    render(
      <SearchResultsHeader
        total={5}
        isLoading={false}
        scopeTruncated
        scopeTruncationReason='TIMEOUT'
      />
    );
    expect(
      queryByText(
        'Only part of your My data lineage scope was searched. Reduce the depth or add filters for a complete set, or open an asset in the Lineage view for its full blast radius.'
      )
    ).toBeNull();
  });
});
