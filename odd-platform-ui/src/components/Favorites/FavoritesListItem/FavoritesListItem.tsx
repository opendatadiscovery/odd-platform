import React from 'react';
import { Grid, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AssetKind, type FavoriteAsset } from 'generated-sources';
import { EntityClassItem, EntityStatus, FavoriteStar } from 'components/shared/elements';
import {
  assetKindSingularLabel,
  favoriteAssetDescription,
  favoriteAssetId,
  favoriteAssetLink,
  favoriteAssetName,
  favoriteAssetNamespace,
} from '../lib';

interface FavoritesListItemProps {
  asset: FavoriteAsset;
}

/**
 * One row of the Favorites tab (#1815 / PRD-0002 A5). Reuses the catalog result-row information —
 * the name (linked to its detail page), the asset kind, the data-entity class chips + status, the
 * term namespace, and a truncated definition/query — resolved per-kind from the fields the favorites
 * payload already carries, degrading where a kind has none (a Query Example has no namespace; the
 * data-entity namespace/created-at await the payload-enrichment slice). Plus a star to un-star.
 */
const FavoritesListItem: React.FC<FavoritesListItemProps> = ({ asset }) => {
  const { t } = useTranslation();
  const id = favoriteAssetId(asset);
  const name = favoriteAssetName(asset);
  const link = favoriteAssetLink(asset);
  const namespace = favoriteAssetNamespace(asset);
  const description = favoriteAssetDescription(asset);
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
      justifyContent='space-between'
      flexWrap='nowrap'
      sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Grid container flexDirection='column' overflow='hidden' sx={{ pr: 1 }}>
        <Grid container alignItems='center' flexWrap='nowrap' gap={0.5} overflow='hidden'>
          {link ? (
            <MuiLink component={Link} to={link} variant='body1' noWrap title={name}>
              {name}
            </MuiLink>
          ) : (
            <Typography variant='body1' noWrap title={name}>
              {name}
            </Typography>
          )}
          {entityClasses?.map(entityClass => (
            <EntityClassItem
              sx={{ ml: 0.5 }}
              key={entityClass.id}
              entityClassName={entityClass.name}
            />
          ))}
          {status && <EntityStatus entityStatus={status} />}
        </Grid>
        <Grid
          container
          alignItems='center'
          flexWrap='nowrap'
          gap={1}
          overflow='hidden'
          sx={{ mt: 0.25 }}
        >
          <Typography variant='subtitle2' sx={{ whiteSpace: 'nowrap' }}>
            {t(assetKindSingularLabel[asset.assetKind])}
          </Typography>
          {namespace && (
            <Typography variant='subtitle2' noWrap title={namespace}>
              {namespace}
            </Typography>
          )}
          {description && (
            <Typography variant='subtitle2' noWrap title={description}>
              {description}
            </Typography>
          )}
        </Grid>
      </Grid>
      <FavoriteStar assetKind={asset.assetKind} assetId={id} />
    </Grid>
  );
};

export default FavoritesListItem;
