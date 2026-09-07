import React from 'react';
import { Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppInfo } from 'lib/hooks/api';
import { fetchRecentlyViewedList } from 'redux/thunks';
import { getRecentlyViewedList } from 'redux/selectors';
import { EmptyContentPlaceholder, RecentlyViewedTag } from 'components/shared/elements';
import { buildSearchLink } from 'lib/hooks';
import { RecentlyViewedIcon, AlertIcon } from 'components/shared/icons';
import {
  recentlyViewedAssetId,
  recentlyViewedAssetLink,
  recentlyViewedAssetName,
} from 'components/RecentlyViewed/lib';
import * as S from '../DataEntityList/DataEntityListStyles';

const COLUMN_SIZE = 5;

/** ST-10 (#1844) — built with the canonical serialiser: a hand-written URL diverges byte-wise from what the
 * Search page's facet→URL mirror produces, and the mirror would immediately rewrite it, dropping the scope the
 * link exists to apply. */
const recencySearchLink = buildSearchLink({ recentlyViewed: {}, sort: 'last_viewed' });

/**
 * The Recently Viewed column of the Recommended section (#1816). Renders in the SAME column form-factor as
 * Favorites / My-Objects / Popular (the shared DataEntityList styles, lg=3) for every audience. Under
 * `auth.type=DISABLED` the history is a shared instance-wide bucket, so the caption is labelled
 * non-possessively "(shared)". Each row carries a remove control.
 *
 * ST-10 (#1844 / #1832, ADR D8) closes the loop the foundation left open: "View all" deep-links into the catalog
 * search scoped to this user's history and ordered most-recently-opened first — the tile, continued. The sort is
 * spelled out even though the scope makes it the default, so the URL says what it means and survives a change to
 * that default. A filter alone would reproduce the SET but not the ORDER, which is what makes a panel link honest.
 */
const RecentlyViewedColumn: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const recentlyViewed = useAppSelector(getRecentlyViewedList);
  const { data: appInfo } = useAppInfo();
  const isShared = appInfo?.authType === 'DISABLED';

  React.useEffect(() => {
    dispatch(fetchRecentlyViewedList({ page: 1, size: COLUMN_SIZE }));
  }, [dispatch]);

  const items = recentlyViewed.slice(0, COLUMN_SIZE);

  return (
    <S.DataEntityListContainer item lg={3} data-qa='recommended-recently-viewed'>
      <S.SectionCaption variant='h4' sx={{ mb: 2 }}>
        <RecentlyViewedIcon />
        {isShared ? t('Recently Viewed (shared)') : t('Recently Viewed')}
      </S.SectionCaption>
      <S.ListLinksContainer $isListEmpty={items.length === 0}>
        {items.map(asset => {
          const link = recentlyViewedAssetLink(asset);
          const name = recentlyViewedAssetName(asset);
          const id = recentlyViewedAssetId(asset);
          // Only data entities carry alerts; a term / query example resolves no dataEntity ref.
          const hasAlerts = asset.dataEntity?.hasAlerts ?? false;
          return (
            <li key={`${asset.assetKind}:${id}`}>
              <S.ListRow
                container
                alignItems='center'
                justifyContent='space-between'
                flexWrap='nowrap'
                $hasAlerts={hasAlerts}
              >
                <S.ListLinkInnerItem $bounded>
                  {hasAlerts ? (
                    <AlertIcon sx={{ mr: 0.5 }} data-qa='recommended-alert' />
                  ) : null}
                  {link ? (
                    <MuiLink
                      component={Link}
                      to={link}
                      variant='body1'
                      noWrap
                      title={name}
                    >
                      {name}
                    </MuiLink>
                  ) : (
                    <Typography variant='body1' noWrap title={name}>
                      {name}
                    </Typography>
                  )}
                </S.ListLinkInnerItem>
                <RecentlyViewedTag
                  assetKind={asset.assetKind}
                  assetId={id}
                  showTimestamp={false}
                />
              </S.ListRow>
            </li>
          );
        })}
        {items.length === 0 && (
          <EmptyContentPlaceholder
            fullPage={false}
            text={t('Assets you open will appear here.')}
          />
        )}
      </S.ListLinksContainer>
      {items.length > 0 && (
        <MuiLink
          component={Link}
          to={recencySearchLink}
          variant='subtitle2'
          sx={{ mt: 1 }}
          data-qa='recently-viewed-view-all'
        >
          {t('View all')}
        </MuiLink>
      )}
    </S.DataEntityListContainer>
  );
};

export default RecentlyViewedColumn;
