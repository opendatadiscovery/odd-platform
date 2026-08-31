import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AlertIcon } from 'components/shared/icons';

interface SearchResultsHeaderProps {
  total: number;
  isLoading: boolean;
  scopeTruncated?: boolean;
  scopeTruncationReason?: string;
}

/**
 * ST-8 (#1842) — the results header: how many assets matched, and whether that number can be trusted.
 *
 * **Why the count lives here.** Until ST-8 the only place `/search` showed a count was the result tab strip's
 * hint. ST-4 retired the seven class tabs and ST-8 retires the last one (My Objects), so the strip is gone —
 * and with it the count, unless it moves. It reads the CROSS-KIND total from the unified search response,
 * which is also a correction: the tab hint counted data entities only, so it under-reported a mixed result.
 * It renders outside the param-URL gate, so it survives on the legacy `/search/{sessionId}` route too.
 *
 * **Why truncation is loud.** The My-data lineage scope is bounded, so a result can be a strict subset of the
 * true scope. Impact analysis is the reason people use that filter — an operator who reads "17 downstream
 * consumers" and concludes they have told everyone has been misled by a partial set presented as a total. So
 * a truncated total is never printed bare: the count is qualified (`17+`, "partial") and a persistent strip
 * (not a toast — it must live as long as the claim is on screen) names the cause and the remedy.
 */
const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  total,
  isLoading,
  scopeTruncated,
  scopeTruncationReason,
}) => {
  const { t } = useTranslation();
  // TIMEOUT means no scope was applied at all, so there is no partial count to qualify — only a warning.
  const isPartialCount = Boolean(scopeTruncated) && scopeTruncationReason !== 'TIMEOUT';

  return (
    <Grid container direction='column' sx={{ mt: 1 }}>
      {!isLoading && (
        <Typography variant='subtitle1' data-testid='search-results-count'>
          {isPartialCount
            ? t('{{total}}+ results (partial)', { total })
            : t('{{total}} results', { total })}
        </Typography>
      )}
      {scopeTruncated && (
        <Grid
          container
          alignItems='center'
          wrap='nowrap'
          sx={{ mt: 0.5 }}
          data-testid='search-scope-truncated'
        >
          <AlertIcon sx={{ mr: 0.5 }} />
          <Typography variant='subtitle2' color='warning.main'>
            {scopeTruncationReason === 'TIMEOUT'
              ? t(
                  'Your My data scope could not be resolved in time, so it was not applied. Reduce the depth or narrow your filters.'
                )
              : t(
                  'Only part of your My data lineage scope was searched. Reduce the depth or add filters for a complete set, or open an asset in the Lineage view for its full blast radius.'
                )}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default SearchResultsHeader;
