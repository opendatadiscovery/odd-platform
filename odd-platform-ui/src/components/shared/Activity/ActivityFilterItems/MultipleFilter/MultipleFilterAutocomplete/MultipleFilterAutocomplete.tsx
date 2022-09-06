import React, { HTMLAttributes } from 'react';
import {
  Autocomplete,
  AutocompleteRenderOptionState,
} from '@mui/material';
import { useDebouncedCallback } from 'use-debounce';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { useAppDispatch } from 'redux/lib/hooks';
import uniq from 'lodash/uniq';
import { fetchOwnersList, fetchTagsList } from 'redux/thunks';
import { ActivityFilterOption, ActivityQueryName } from 'redux/interfaces';
import { AutocompleteInputChangeReason } from '@mui/material/useAutocomplete';
import { setActivityQueryParam } from 'redux/slices/activity.slice';
import AppInput from 'components/shared/AppInput/AppInput';
import * as S from 'components/shared/Activity/ActivityFilterItems/MultipleFilter/MultipleFilterAutocomplete/MultipleFilterAutocompleteStyles';

interface MultipleFilterAutocompleteProps {
  filterName: ActivityQueryName;
  name: string;
  selectedOptionIds: number[];
}

const MultipleFilterAutocomplete: React.FC<
  MultipleFilterAutocompleteProps
> = ({ name, filterName, selectedOptionIds }) => {
  type FilterOption = ActivityFilterOption;

  const dispatch = useAppDispatch();

  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState<string>('');

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      (filterName === 'tagIds'
        ? dispatch(
            fetchTagsList({
              page: 1,
              size: 30,
              query: searchText,
            })
          )
        : dispatch(
            fetchOwnersList({
              page: 1,
              size: 30,
              query: searchText,
            })
          )
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
    if (autocompleteOpen) {
      handleSearch();
    }
  }, [autocompleteOpen, searchText]);

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    value: FilterOption | null | string
  ) => {
    if (!value) return;
    if (typeof value === 'string') return;
    setSearchText(''); // Clear input on select

    if (value.id) {
      dispatch(
        setActivityQueryParam({
          queryName: filterName,
          queryData: uniq([...(selectedOptionIds || []), value.id]),
        })
      );
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
    const highlightedText = (
      text: string | undefined,
      highlight: string
    ) => {
      const parts = text?.split(new RegExp(`(${highlight})`, 'gi'));
      return (
        <span>
          {parts?.map((part, i) => (
            <S.HighlightedTextPart
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              isHighlighted={
                part.toLowerCase() === highlight.toLowerCase()
              }
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
      id="dataentity-tag-add-name-search"
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
        <AppInput
          {...params}
          sx={{ mt: 2 }}
          ref={params.InputProps.ref}
          label={name}
          placeholder="Search by name…"
          customEndAdornment={{
            variant: 'loader',
            showAdornment: loading,
            position: { mr: 4 },
          }}
        />
      )}
      renderOption={fillOptionMatches}
    />
  );
};

export default MultipleFilterAutocomplete;
