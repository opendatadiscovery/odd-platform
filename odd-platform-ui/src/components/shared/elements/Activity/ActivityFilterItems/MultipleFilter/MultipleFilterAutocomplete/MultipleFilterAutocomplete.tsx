import React, { type HTMLAttributes } from 'react';
import { Box, type AutocompleteRenderOptionState } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useDebouncedCallback } from 'use-debounce';
import uniq from 'lodash/uniq';
import { type AutocompleteInputChangeReason } from '@mui/material/useAutocomplete';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchActivityUsersList, fetchOwnersList, fetchTagsList } from 'redux/thunks';
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
  // Optional inline affordance rendered next to the field label (e.g. an InformationHint).
  hint?: React.ReactNode;
}

const MultipleFilterAutocomplete: React.FC<MultipleFilterAutocompleteProps> = ({
  name,
  filterName,
  hint,
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

      // The User filter lists the recorded actor usernames (activity.created_by), each shown with
      // its current owner name when one exists; tag/owner filters list the directory entities (#1657).
      if (filterName === 'usernames') {
        dispatch(fetchActivityUsersList(params))
          .unwrap()
          .then(response => {
            setLoading(false);
            setOptions(
              response.items.map(user => ({
                id: user.identity.username,
                name: user.owner?.name
                  ? `${user.owner.name} (${user.identity.username})`
                  : user.identity.username,
              }))
            );
          });
        return;
      }

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
    [setLoading, setOptions, searchText, filterName, dispatch]
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
      // The filter element type is number[] (tagIds/ownerIds) or string[] (usernames); the
      // runtime id matches its own filter, but the heterogeneous union defeats inference on the
      // computed key, so we assert the rebuilt query is well-formed.
      setQueryParams(
        prev =>
          ({
            ...prev,
            [filterName]: uniq([
              ...((prev[filterName] ?? []) as Array<number | string>),
              value.id,
            ]),
          }) as ActivityQuery
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
    const highlightedText = (text: string | undefined, highlight: string) => {
      const parts = text?.split(new RegExp(`(${highlight})`, 'gi'));
      return (
        <span>
          {parts?.map((part, idx) => (
            <S.HighlightedTextPart
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
          label={
            hint ? (
              <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                {name}
                {hint}
              </Box>
            ) : (
              name
            )
          }
          placeholder='Search by name…'
          isLoading={loading}
        />
      )}
      renderOption={fillOptionMatches}
    />
  );
};

export default MultipleFilterAutocomplete;
