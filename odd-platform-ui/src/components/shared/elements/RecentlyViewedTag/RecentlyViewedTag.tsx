import React from 'react';
import { Grid, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { AssetKind } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchRecentlyViewedStatus, removeRecentlyViewed } from 'redux/thunks';
import { getRecentlyViewedRefState } from 'redux/selectors';
import { ClearIcon } from 'components/shared/icons';
import { useAppDateTime } from 'lib/hooks';

interface RecentlyViewedTagProps {
  assetKind: AssetKind;
  assetId: number;
  /** When false, only the remove control renders (the relative time moves to the tooltip) — for tight rows. */
  showTimestamp?: boolean;
}

/**
 * Cross-surface Recently-Viewed marker (#1816): on an asset detail header, a search/list row, or the home
 * panel, shows when the current user last opened the asset + a remove control — but ONLY when the asset is in
 * their history. Self-hydrates its status once via the batch endpoint (a list pre-hydrates all its rows in one
 * call), and renders nothing when the asset is not recently viewed. Removal is principal-scoped server-side.
 */
const RecentlyViewedTag: React.FC<RecentlyViewedTagProps> = ({
  assetKind,
  assetId,
  showTimestamp = true,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { formatDistanceToNowStrict } = useAppDateTime();
  const refState = useAppSelector(getRecentlyViewedRefState(assetKind, assetId));

  // Self-hydrate: if this asset's recency is unknown, batch-ask once.
  React.useEffect(() => {
    if (refState === undefined) {
      dispatch(fetchRecentlyViewedStatus({ assetRef: [{ assetKind, assetId }] }));
    }
  }, [dispatch, refState, assetKind, assetId]);

  if (!refState) return null;

  const viewedLabel = t('Viewed {{when}}', {
    when: formatDistanceToNowStrict(refState.lastViewedAt, { addSuffix: true }),
  });

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    dispatch(removeRecentlyViewed({ assetKind, assetId }));
  };

  return (
    <Grid
      container
      alignItems='center'
      flexWrap='nowrap'
      width='auto'
      columnGap={0.25}
      data-qa='recently-viewed-tag'
      title={viewedLabel}
    >
      {showTimestamp && (
        <Typography variant='caption' noWrap data-qa='recently-viewed-when'>
          {viewedLabel}
        </Typography>
      )}
      <IconButton
        onClick={handleRemove}
        aria-label={t('Remove from recently viewed')}
        data-qa='recently-viewed-remove'
        size='small'
        sx={{ p: 0.25 }}
      >
        <ClearIcon />
      </IconButton>
    </Grid>
  );
};

export default RecentlyViewedTag;
