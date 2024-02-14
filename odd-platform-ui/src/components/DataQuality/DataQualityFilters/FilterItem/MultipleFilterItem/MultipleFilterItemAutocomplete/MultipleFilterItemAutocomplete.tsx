import React, {
  type ChangeEvent,
  type FC,
  type HTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Autocomplete, type AutocompleteRenderOptionState, Grid } from '@mui/material';
import {
  type AutocompleteInputChangeReason,
  type FilterOptionsState,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { useTranslation } from 'react-i18next';
import { Input } from 'components/shared/elements';
import { ClearIcon, DropdownIcon } from 'components/shared/icons';
import * as S from './MultipleFilterItemAutocompleteStyles';
import type { HookResult, FilterOption } from '../../../../interfaces';

interface Props {
  name: string;
  hookResult: HookResult;
  searchText: string;
  setSearchText: (value: React.SetStateAction<string>) => void;
  selectedOptions: FilterOption[];
  onSelectOption: (value: FilterOption) => void;
}

const MultipleFilterItemAutocomplete: FC<Props> = ({
  name,
  hookResult,
  searchText,
  setSearchText,
  selectedOptions,
  onSelectOption,
}) => {
  const { t } = useTranslation();

  type Option = Omit<FilterOption, 'id'>;

  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);

  const filter = createFilterOptions<Option>();

  const handleAutocompleteSelect = (
    _: ChangeEvent<unknown>,
    option: string | Option | null
  ) => {
    if (!option) return;
    setSearchText(''); // Clear input on select
    onSelectOption(option as FilterOption);
  };

  const searchInputChange = useCallback(
    (_: ChangeEvent<unknown>, query: string, reason: AutocompleteInputChangeReason) => {
      if (reason === 'input') {
        setSearchText(query);
      } else {
        setSearchText(''); // Clear input on select
      }
    },
    [setSearchText]
  );

  const getOptionLabel = useCallback((option: string | Option) => {
    if (typeof option === 'string') {
      return option;
    }
    return option.name || '';
  }, []);

  const getFilterOptions = useCallback(
    (_: unknown, params: FilterOptionsState<Option>) => {
      const optionsWithoutSelected = options.filter(
        option =>
          !selectedOptions.some(selectedOption => selectedOption.name === option.name)
      );
      const optionsFiltered = searchText
        ? optionsWithoutSelected.filter(option =>
            option.name.toLowerCase().includes(searchText.toLowerCase())
          )
        : optionsWithoutSelected;
      return filter(optionsFiltered, params);
    },
    [searchText, options, selectedOptions]
  );

  useEffect(() => {
    if (!autocompleteOpen) return;
    setOptionsLoading(true);

    if (hookResult.isSuccess) {
      setOptions(
        hookResult.data.items.map(item => ({
          name: item.name,
          id: item.id,
        }))
      );
      setOptionsLoading(false);
    }
  }, [searchText, autocompleteOpen]);

  const fillOptionMatches = (
    props: HTMLAttributes<HTMLLIElement>,
    option: Option,
    state: AutocompleteRenderOptionState
  ) => {
    if (!state.inputValue) {
      return (
        <li {...props}>
          <Grid container justifyContent='space-between'>
            <span>{option.name}</span>
          </Grid>
        </li>
      );
    }

    const highlightedText = (text: string, highlight: string) => {
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return (
        <span>
          {parts.map((part, i) => (
            <S.HighlightedTextPart
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              isHighlighted={part.toLowerCase() === highlight.toLowerCase()}
            >
              {part}
            </S.HighlightedTextPart>
          ))}
        </span>
      );
    };

    return (
      <li {...props}>
        <Grid container justifyContent='space-between'>
          {highlightedText(option.name, state.inputValue)}
        </Grid>
      </li>
    );
  };

  return (
    <Autocomplete
      fullWidth
      id={`data-quality-filter-${name}`}
      open={autocompleteOpen}
      onOpen={() => setAutocompleteOpen(true)}
      onClose={() => setAutocompleteOpen(false)}
      onChange={handleAutocompleteSelect}
      options={options}
      onInputChange={searchInputChange}
      getOptionLabel={getOptionLabel}
      filterOptions={getFilterOptions}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      value={{ name: searchText }}
      noOptionsText={optionsLoading ? '' : 'No options'}
      renderOption={fillOptionMatches}
      popupIcon={<DropdownIcon />}
      clearIcon={<ClearIcon />}
      freeSolo
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
  );
};

export default MultipleFilterItemAutocomplete;
