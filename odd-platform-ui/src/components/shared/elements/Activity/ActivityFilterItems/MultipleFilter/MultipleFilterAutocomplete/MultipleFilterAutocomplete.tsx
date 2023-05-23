import React, { type HTMLAttributes } from 'react';
import { type AutocompleteRenderOptionState } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useDebouncedCallback } from 'use-debounce';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import uniq from 'lodash/uniq';
import { fetchOwnersList, fetchTagsList } from 'redux/thunks';
import { type AutocompleteInputChangeReason } from '@mui/material/useAutocomplete';
import { useQueryParams } from 'lib/hooks';
import {
  type ActivityMultipleFilterNames,
  type ActivityQuery,
  type ActivityFilterOption,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import Input from 'components/shared/elements/Input/Input';
import * as S from './MultipleFilterAutocompleteStyles';

interface MultipleFilterAutocompleteProps {
  filterName: ActivityMultipleFilterNames;
  name: string;
}

const MultipleFilterAutocomplete: React.FC<MultipleFilterAutocompleteProps> = ({
  name,
  filterName,
}) => {
  type FilterOption = ActivityFilterOption;

  const dispatch = useAppDispatch();
  const { setQueryParams } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      const params = { page: 1, size: 100, query: searchText };

      (filterName === 'tagIds'
        ? dispatch(fetchTagsList(params))
        : dispatch(fetchOwnersList(params))
      )
        .unwrap()
        .then(response => {
          setLoading(false);
          setOptions(response.items);
        });
    }, 500),
    [setLoading, setOptions, searchText]
  );

  const getOptionLabel = (option: FilterOption | string) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  };

  React.useEffect(() => {
    setLoading(autocompleteOpen);
    if (autocompleteOpen) handleSearch();
  }, [autocompleteOpen, searchText]);

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    value: FilterOption | null | string
  ) => {
    if (!value) return;
    if (typeof value === 'string') return;
    setSearchText(''); // Clear input on select

    if (value.id) {
      setQueryParams(prev => ({
        ...prev,
        [filterName]: uniq([...(prev[filterName] || []), value.id]),
      }));
    }
  };

  const searchInputChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      query: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') {
        setSearchText(query);
      } else {
        setSearchText(''); // Clear input on select
      }
    },
    [setSearchText]
  );

  const fillOptionMatches = (
    props: HTMLAttributes<HTMLLIElement>,
    option: FilterOption,
    state: AutocompleteRenderOptionState
  ) => {
    const highlightedText = (text: string | undefined, highlight: string) => {
      const parts = text?.split(new RegExp(`(${highlight})`, 'gi'));
      return (
        <span>
          {parts?.map((part, idx) => (
            <S.HighlightedTextPart
              // eslint-disable-next-line react/no-array-index-key
              key={`${part}-${idx}`}
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
        <S.OptionsContainer $isImportant={option.important}>
          {highlightedText(option.name, state.inputValue)}
        </S.OptionsContainer>
      </li>
    );
  };

  return (
    <Autocomplete
      fullWidth
      open={autocompleteOpen}
      onOpen={() => setAutocompleteOpen(true)}
      onClose={() => setAutocompleteOpen(false)}
      onChange={handleAutocompleteSelect}
      onInputChange={searchInputChange}
      options={options}
      getOptionLabel={getOptionLabel}
      loading={loading}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      freeSolo
      value={{ name: searchText, id: 0 }}
      clearIcon={<ClearIcon />}
      renderInput={params => (
        <Input
          sx={{ mt: 2 }}
          variant='main-m'
          inputContainerRef={params.InputProps.ref}
          inputProps={params.inputProps}
          label={name}
          placeholder='Search by name…'
          isLoading={loading}
        />
      )}
      renderOption={fillOptionMatches}
    />
  );
};

export default MultipleFilterAutocomplete;
