import React from 'react';
import { Grid, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { FavoriteAsset } from 'generated-sources';
import { FavoriteStar } from 'components/shared/elements';
import {
  assetKindSingularLabel,
  favoriteAssetId,
  favoriteAssetLink,
  favoriteAssetName,
} from '../lib';

interface FavoritesListItemProps {
  asset: FavoriteAsset;
}

/** One row of the Favorites tab: the asset name (linked to its detail page), a muted kind label,
 * and a star to un-star. Un-starring removes the row from the list (favorites slice). */
const FavoritesListItem: React.FC<FavoritesListItemProps> = ({ asset }) => {
  const { t } = useTranslation();
  const id = favoriteAssetId(asset);
  const name = favoriteAssetName(asset);
  const link = favoriteAssetLink(asset);

  return (
    <Grid
      container
      alignItems='center'
      justifyContent='space-between'
      flexWrap='nowrap'
      sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Grid container alignItems='center' flexWrap='nowrap' gap={1} overflow='hidden'>
        {link ? (
          <MuiLink component={Link} to={link} variant='body1' noWrap>
            {name}
          </MuiLink>
        ) : (
          <Typography variant='body1' noWrap>
            {name}
          </Typography>
        )}
        <Typography variant='subtitle2' sx={{ whiteSpace: 'nowrap' }}>
          {t(assetKindSingularLabel[asset.assetKind])}
        </Typography>
      </Grid>
      <FavoriteStar assetKind={asset.assetKind} assetId={id} />
    </Grid>
  );
};

export default FavoritesListItem;
