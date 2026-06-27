import React from 'react';
import { FormControlLabel, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { AssetKind } from 'generated-sources';
import { Checkbox } from 'components/shared/elements';
import { ASSET_KIND_OPTIONS } from '../lib';

interface FavoritesAssetTypeFilterProps {
  selectedKinds: AssetKind[];
  onChange: (kinds: AssetKind[]) => void;
}

/**
 * The Favorites tab's only facet: a fixed three-option asset-type filter (#1815). Selecting none
 * means "all kinds"; selecting some narrows the list to those kinds (the `asset_types` query param
 * the list endpoint supports). A fixed set, so a plain checkbox group — not the async autocomplete
 * the catalog facets use.
 */
const FavoritesAssetTypeFilter: React.FC<FavoritesAssetTypeFilterProps> = ({
  selectedKinds,
  onChange,
}) => {
  const { t } = useTranslation();

  const toggle = (kind: AssetKind) => () =>
    onChange(
      selectedKinds.includes(kind)
        ? selectedKinds.filter(selected => selected !== kind)
        : [...selectedKinds, kind]
    );

  return (
    <Grid container flexDirection='column'>
      <Typography variant='h4' sx={{ mb: 1 }}>
        {t('Asset type')}
      </Typography>
      {ASSET_KIND_OPTIONS.map(({ kind, labelKey }) => (
        <FormControlLabel
          key={kind}
          checked={selectedKinds.includes(kind)}
          onChange={toggle(kind)}
          control={<Checkbox sx={{ mr: 1 }} />}
          label={t(labelKey)}
        />
      ))}
    </Grid>
  );
};

export default FavoritesAssetTypeFilter;
