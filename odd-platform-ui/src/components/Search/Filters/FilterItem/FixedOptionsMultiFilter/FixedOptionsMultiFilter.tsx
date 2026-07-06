import React from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'components/shared/elements';
import { ClearIcon, DropdownIcon } from 'components/shared/icons';
import * as S from './FixedOptionsMultiFilterStyles';

export interface FixedFilterOption {
  id: string | number;
  name: string;
}

interface FixedOptionsMultiFilterProps {
  /** the visible label ("Asset type", "Data entity type") */
  name: string;
  /** a space-free identifier for the control's DOM id (`filter-<filterId>`, matching `#filter-statuses`) */
  filterId: string;
  options: ReadonlyArray<FixedFilterOption>;
  selectedIds: ReadonlyArray<string | number>;
  onSelect: (option: FixedFilterOption) => void;
  onRemove: (option: FixedFilterOption) => void;
}

/**
 * The standard search-filter MULTISELECT (identical control to `MultipleFilterItem` — Statuses / Tag / Owner:
 * an autocomplete input above, removable chips below) for a FIXED, small option set that is NOT a
 * server-aggregated facet — e.g. the cross-kind **Asset type** ({@link AssetKind}) and the **Data entity type**
 * (the entity classes). Selecting an option adds a chip; the "×" on a chip removes it. There is deliberately NO
 * per-filter Clear All — the single Filters-panel "Clear All" clears every filter.
 */
const FixedOptionsMultiFilter: React.FC<FixedOptionsMultiFilterProps> = ({
  name,
  filterId,
  options,
  selectedIds,
  onSelect,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = React.useState('');

  const selected = React.useMemo(
    () => options.filter(o => selectedIds.includes(o.id)),
    [options, selectedIds]
  );
  const available = React.useMemo(
    () => options.filter(o => !selectedIds.includes(o.id)),
    [options, selectedIds]
  );

  return (
    <Grid container>
      <Grid item xs={12}>
        <Autocomplete
          fullWidth
          id={`filter-${filterId}`}
          options={available}
          value={null}
          inputValue={inputValue}
          onInputChange={(_, query, reason) =>
            setInputValue(reason === 'input' ? query : '')
          }
          onChange={(_, option) => {
            if (option) {
              onSelect(option);
              setInputValue('');
            }
          }}
          getOptionLabel={option => option.name}
          isOptionEqualToValue={(option, val) => option.id === val.id}
          handleHomeEndKeys
          selectOnFocus
          blurOnSelect
          popupIcon={<DropdownIcon />}
          clearIcon={<ClearIcon />}
          noOptionsText={t('No options')}
          renderInput={params => (
            <Input
              sx={{ mt: 2 }}
              variant='main-m'
              inputContainerRef={params.InputProps.ref}
              inputProps={params.inputProps}
              label={name}
              placeholder={t('Search by name')}
            />
          )}
        />
      </Grid>
      <Grid display='inline-flex' item xs={12} sx={{ my: 0.25, mx: -0.25 }} container>
        {selected.map(option => (
          <S.Chip key={option.id} container>
            <Typography noWrap title={option.name}>
              {option.name}
            </Typography>
            <Button
              sx={{ ml: 0.5 }}
              buttonType='linkGray-m'
              icon={<ClearIcon />}
              onClick={() => onRemove(option)}
            />
          </S.Chip>
        ))}
      </Grid>
    </Grid>
  );
};

export default FixedOptionsMultiFilter;
