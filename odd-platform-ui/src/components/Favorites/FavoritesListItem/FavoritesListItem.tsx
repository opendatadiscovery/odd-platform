import React from 'react';
import { Box, Grid, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AssetKind, type FavoriteAsset } from 'generated-sources';
import { EntityClassItem, EntityStatus, FavoriteStar } from 'components/shared/elements';
import { SearchCol } from 'components/Search/Results/Results.styles';
import { useAppDateTime } from 'lib/hooks';
import {
  assetKindSingularLabel,
  FAVORITES_TABLE_COLS as COL,
  favoriteAssetId,
  favoriteAssetLink,
  favoriteAssetName,
  favoriteAssetNamespace,
  favoriteAssetUpdatedAt,
} from '../lib';

interface FavoritesListItemProps {
  asset: FavoriteAsset;
}

/**
 * One row of the Favorites tab, in the same column-aligned table layout the catalog Search results use
 * (#1815 / PRD-0002 A5; the shared `Search/Results` grid + `SearchCol`): Name (+ the favorite star,
 * right after the name — the same position as the Search result row) · Type (the asset kind + the
 * data-entity class chips + status) · Namespace · Updated, resolved per-kind from the favorites payload
 * and degrading where a kind has none (the data-entity namespace/updated arrive with the payload-
 * enrichment slice).
 */
const FavoritesListItem: React.FC<FavoritesListItemProps> = ({ asset }) => {
  const { t } = useTranslation();
  const { formatDistanceToNowStrict } = useAppDateTime();
  const id = favoriteAssetId(asset);
  const name = favoriteAssetName(asset);
  const link = favoriteAssetLink(asset);
  const namespace = favoriteAssetNamespace(asset);
  const updatedAt = favoriteAssetUpdatedAt(asset);
  const entityClasses =
    asset.assetKind === AssetKind.DATA_ENTITY
      ? asset.dataEntity?.entityClasses
      : undefined;
  const status =
    asset.assetKind === AssetKind.DATA_ENTITY ? asset.dataEntity?.status : undefined;

  return (
    <Grid
      container
      alignItems='center'
      flexWrap='nowrap'
      sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <SearchCol item lg={COL.nm} md={COL.nm} container alignItems='center' wrap='nowrap'>
        <Box display='flex' alignItems='center' overflow='hidden'>
          {link ? (
            <MuiLink component={Link} to={link} variant='body1' noWrap title={name}>
              {name}
            </MuiLink>
          ) : (
            <Typography variant='body1' noWrap title={name}>
              {name}
            </Typography>
          )}
        </Box>
        <FavoriteStar assetKind={asset.assetKind} assetId={id} />
      </SearchCol>
      <SearchCol item lg={COL.ty} md={COL.ty} container alignItems='center' wrap='nowrap'>
        <Typography variant='body1' noWrap>
          {t(assetKindSingularLabel[asset.assetKind])}
        </Typography>
        {entityClasses?.map(entityClass => (
          <EntityClassItem
            sx={{ ml: 0.5 }}
            key={entityClass.id}
            entityClassName={entityClass.name}
          />
        ))}
        {status && <EntityStatus entityStatus={status} />}
      </SearchCol>
      <SearchCol item lg={COL.nd} md={COL.nd}>
        <Typography variant='body1' noWrap title={namespace}>
          {namespace ?? ''}
        </Typography>
      </SearchCol>
      <SearchCol item lg={COL.up} md={COL.up}>
        <Typography variant='body1' noWrap>
          {updatedAt ? formatDistanceToNowStrict(updatedAt, { addSuffix: true }) : ''}
        </Typography>
      </SearchCol>
    </Grid>
  );
};

export default FavoritesListItem;
