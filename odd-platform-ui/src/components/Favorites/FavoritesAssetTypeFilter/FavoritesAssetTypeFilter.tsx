import React from 'react';
import { Autocomplete, Chip, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { AssetKind } from 'generated-sources';
import { Button, Input } from 'components/shared/elements';
import { ClearIcon, DropdownIcon } from 'components/shared/icons';
import { ASSET_KIND_OPTIONS } from '../lib';

interface FavoritesAssetTypeFilterProps {
  selectedKinds: AssetKind[];
  onChange: (kinds: AssetKind[]) => void;
}

type AssetTypeOption = (typeof ASSET_KIND_OPTIONS)[number];

/**
 * The Favorites tab's Asset-type facet (#1815 / PRD-0002 A1; ADR D8 — a grouped multi-select,
 * default *All*). Matches the platform's catalog-Search facet pattern — an autocomplete that adds
 * a kind per pick, the selections shown as removable chips below, and a "Clear All" — rather than
 * the S3 bespoke checkbox group, so the surface is consistent with every other list in the platform.
 * Selecting none means "all kinds"; the chosen kinds drive the `asset_types` list-endpoint param.
 */
const FavoritesAssetTypeFilter: React.FC<FavoritesAssetTypeFilterProps> = ({
  selectedKinds,
  onChange,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = React.useState('');

  // The autocomplete offers only kinds not yet selected; picking one appends it (single-select that
  // resets), and the chips below own removal — the catalog MultipleFilterItem behaviour.
  const availableOptions = React.useMemo(
    () => ASSET_KIND_OPTIONS.filter(option => !selectedKinds.includes(option.kind)),
    [selectedKinds]
  );

  const handleSelect = (_: React.SyntheticEvent, option: AssetTypeOption | null) => {
    if (option) onChange([...selectedKinds, option.kind]);
    setInputValue('');
  };

  const handleRemove = (kind: AssetKind) =>
    onChange(selectedKinds.filter(selected => selected !== kind));

  return (
    <Grid container flexDirection='column'>
      <Grid container justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
        <Typography variant='h4'>{t('Asset type')}</Typography>
        {selectedKinds.length > 0 && (
          <Button
            text={t('Clear All')}
            buttonType='tertiary-m'
            onClick={() => onChange([])}
          />
        )}
      </Grid>
      <Autocomplete
        fullWidth
        value={null}
        options={availableOptions}
        onChange={handleSelect}
        inputValue={inputValue}
        onInputChange={(_, value, reason) => {
          if (reason === 'input') setInputValue(value);
        }}
        getOptionLabel={option => t(option.labelKey)}
        isOptionEqualToValue={(option, value) => option.kind === value.kind}
        blurOnSelect
        popupIcon={<DropdownIcon />}
        clearIcon={<ClearIcon />}
        noOptionsText={t('No options')}
        renderInput={params => (
          <Input
            variant='main-m'
            inputContainerRef={params.InputProps.ref}
            inputProps={{ ...params.inputProps, 'aria-label': t('Asset type') }}
            placeholder={t('All')}
          />
        )}
      />
      {selectedKinds.length > 0 && (
        <Grid container gap={0.5} sx={{ mt: 1 }}>
          {selectedKinds.map(kind => {
            const option = ASSET_KIND_OPTIONS.find(o => o.kind === kind);
            return (
              <Chip
                key={kind}
                size='small'
                label={t(option?.labelKey ?? kind)}
                onDelete={() => handleRemove(kind)}
                deleteIcon={<ClearIcon aria-label={t('Remove')} />}
              />
            );
          })}
        </Grid>
      )}
    </Grid>
  );
};

export default FavoritesAssetTypeFilter;
