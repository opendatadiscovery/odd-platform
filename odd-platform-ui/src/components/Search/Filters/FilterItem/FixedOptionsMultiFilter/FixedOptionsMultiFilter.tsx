import React from 'react';
import { Autocomplete, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'components/shared/elements';
import { ClearIcon, DropdownIcon } from 'components/shared/icons';
import FacetChip from '../FacetChip/FacetChip';
import FacetMatchMode, {
  type FacetMatchModeValue,
} from '../FacetMatchMode/FacetMatchMode';

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
  /**
   * ST-11 (#1845) — the facet-logic surface, OPTIONAL: a filter that passes these carries an Exclude action on every
   * option row, an Exclude / Include toggle on every chip and the excluded chips; a filter that omits them (the
   * Asset-type kinds — single-valued, and a kind's exclusion is the complement selection) renders exactly as before.
   */
  excludedIds?: ReadonlyArray<string | number>;
  onExclude?: (option: FixedFilterOption) => void;
  onInclude?: (option: FixedFilterOption) => void;
  /** ST-11 — the `Match any | Match all` control, rendered when set and two or more values are selected */
  matchMode?: FacetMatchModeValue;
  onMatchModeChange?: (mode: FacetMatchModeValue) => void;
}

/**
 * The standard search-filter MULTISELECT (identical control to `MultipleFilterItem` — Statuses / Tag / Owner:
 * an autocomplete input above, removable chips below) for a FIXED, small option set that is NOT a
 * server-aggregated facet — e.g. the cross-kind **Asset type** ({@link AssetKind}) and the **Data entity type**
 * (the entity classes). Selecting an option adds a chip; the "×" on a chip removes it. There is deliberately NO
 * per-filter Clear All — the single Filters-panel "Clear All" clears every filter. The chip is the rail's one
 * `FacetChip` (ST-11 consolidated the two identical chip styles).
 */
const FixedOptionsMultiFilter: React.FC<FixedOptionsMultiFilterProps> = ({
  name,
  filterId,
  options,
  selectedIds,
  onSelect,
  onRemove,
  excludedIds = [],
  onExclude,
  onInclude,
  matchMode,
  onMatchModeChange,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(
    () => options.filter(o => selectedIds.includes(o.id)),
    [options, selectedIds]
  );
  const excluded = React.useMemo(
    () => options.filter(o => excludedIds.includes(o.id)),
    [options, excludedIds]
  );
  const available = React.useMemo(
    () => options.filter(o => !selectedIds.includes(o.id) && !excludedIds.includes(o.id)),
    [options, selectedIds, excludedIds]
  );

  return (
    <Grid container>
      <Grid item xs={12}>
        <Autocomplete
          fullWidth
          id={`filter-${filterId}`}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
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
          renderOption={(props, option) => (
            <li {...props}>
              <Grid
                container
                justifyContent='space-between'
                flexWrap='nowrap'
                alignItems='center'
              >
                <span>{option.name}</span>
                {onExclude && (
                  /* ST-11 — the row's Exclude action, a pointer shortcut hidden from assistive technology (an
                     `option` may not carry interactive descendants; the chip's toggle is the keyboard path);
                     the row's own click stays "include" */
                  <Button
                    buttonType='linkGray-m'
                    text={t('Exclude')}
                    aria-hidden
                    tabIndex={-1}
                    data-qa={`filter-${filterId}-option-exclude`}
                    onMouseDown={event => event.preventDefault()}
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      onExclude(option);
                      setInputValue('');
                      setOpen(false);
                    }}
                    sx={{ ml: 1, flexShrink: 0 }}
                  />
                )}
              </Grid>
            </li>
          )}
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
          <FacetChip
            key={option.id}
            label={option.name}
            facetName={name}
            onToggleExclude={onExclude ? () => onExclude(option) : undefined}
            onRemove={() => onRemove(option)}
            dataQa={`filter-${filterId}-chip`}
          />
        ))}
        {excluded.map(option => (
          <FacetChip
            key={`not-${option.id}`}
            label={option.name}
            facetName={name}
            excluded
            onToggleExclude={onInclude ? () => onInclude(option) : undefined}
            onRemove={() => onRemove(option)}
            dataQa={`filter-${filterId}-chip`}
          />
        ))}
      </Grid>
      {matchMode !== undefined && onMatchModeChange && selected.length >= 2 && (
        <FacetMatchMode
          filterId={filterId}
          value={matchMode}
          onChange={onMatchModeChange}
        />
      )}
    </Grid>
  );
};

export default FixedOptionsMultiFilter;
