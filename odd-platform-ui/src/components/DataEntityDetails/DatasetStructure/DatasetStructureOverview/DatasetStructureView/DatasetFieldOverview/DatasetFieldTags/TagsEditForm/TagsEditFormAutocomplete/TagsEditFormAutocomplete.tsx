import React from 'react';
import { Autocomplete, Typography } from '@mui/material';
import {
  type AutocompleteInputChangeReason,
  type FilterOptionsState,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import { type UseFieldArrayAppend } from 'react-hook-form/dist/types/fieldArray';
import { useTranslation } from 'react-i18next';
import { type Tag } from 'generated-sources';
import { useAppDispatch } from 'redux/lib/hooks';
import { Input, AutocompleteSuggestion } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { fetchTagsList as searchTags } from 'redux/thunks';
import { OptionsContainer } from '../TagsEditFormStyles';

type DatasetFieldTagsFormType = {
  tagNames: Pick<Tag, 'name' | 'important' | 'external'>[];
};

interface TagsEditFormAutocompleteProps {
  append: UseFieldArrayAppend<DatasetFieldTagsFormType, 'tagNames'>;
}

const TagsEditFormAutocomplete: React.FC<TagsEditFormAutocompleteProps> = ({
  append,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  type FilterOption = Omit<Tag, 'id'> & Partial<Tag>;
  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState<string>('');
  const filter = createFilterOptions<FilterOption>();

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      dispatch(searchTags({ page: 1, size: 30, query: searchText }))
        .unwrap()
        .then(({ items }) => {
          setLoading(false);
          setOptions(items);
        });
    }, 500),
    [searchTags, setLoading, setOptions, searchText]
  );

  const getOptionLabel = React.useCallback((option: FilterOption | string) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

  const getFilterOptions = React.useCallback(
    (_: FilterOption[], params: FilterOptionsState<FilterOption>) => {
      const filtered = filter(options, params);
      if (
        searchText !== '' &&
        !loading &&
        !options.find(
          option => option.name.toLocaleLowerCase() === searchText.toLocaleLowerCase()
        )
      ) {
        return [...options, { name: searchText }];
      }
      return filtered;
    },
    [searchText, loading, options]
  );

  const searchInputChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      query: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') {
        return setSearchText(query);
      }
      setSearchText(''); // Clear input on select
    },
    [setSearchText]
  );

  React.useEffect(() => {
    setLoading(autocompleteOpen);
    if (autocompleteOpen) {
      handleSearch();
    }
  }, [autocompleteOpen, searchText]);

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    value: FilterOption | string | null
  ) => {
    if (!value) return;
    setSearchText(''); // Clear input on select
    append(typeof value === 'string' ? { name: value } : { ...value, external: false });
  };

  return (
    <Autocomplete
      fullWidth
      id='dataentity-tag-add-name-search'
      open={autocompleteOpen}
      onOpen={() => setAutocompleteOpen(true)}
      onClose={() => setAutocompleteOpen(false)}
      onChange={handleAutocompleteSelect}
      options={options}
      onInputChange={searchInputChange}
      getOptionLabel={getOptionLabel}
      filterOptions={getFilterOptions}
      loading={loading}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      freeSolo
      value={{ name: searchText }}
      clearIcon={<ClearIcon />}
      renderInput={params => (
        <Input
          sx={{ mt: 2 }}
          variant='main-m'
          inputContainerRef={params.InputProps.ref}
          inputProps={params.inputProps}
          label={t('Tag')}
          placeholder={t('Enter tag name')}
          isLoading={loading}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <OptionsContainer $isImportant={option.important}>
            <Typography variant='body1'>
              {option.id ? (
                option.name
              ) : (
                <AutocompleteSuggestion optionLabel='tag' optionName={option.name} />
              )}
            </Typography>
          </OptionsContainer>
        </li>
      )}
    />
  );
};

export default TagsEditFormAutocomplete;
