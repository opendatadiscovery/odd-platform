import React from 'react';
import { Autocomplete, Typography, Box } from '@mui/material';
import {
  Tag,
  TagApiGetPopularTagListRequest,
  TagsResponse,
  TermApiCreateTermTagsRelationsRequest,
} from 'generated-sources';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import compact from 'lodash/compact';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import TagItem from 'components/shared/TagItem/TagItem';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import { OptionsContainer } from 'components/TermDetails/Overview/OverviewTags/TagsEditForm/TagsEditFormStyles';
import AppButton from 'components/shared/AppButton/AppButton';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppTextField from 'components/shared/AppTextField/AppTextField';

interface TagsEditProps {
  termId: number;
  termDetailsTags?: Tag[];
  isLoading: boolean;
  updateTermDetailsTags: (
    params: TermApiCreateTermTagsRelationsRequest
  ) => Promise<Tag[]>;
  searchTags: (
    params: TagApiGetPopularTagListRequest
  ) => Promise<TagsResponse>;
  btnEditEl: JSX.Element;
}

const TagsEditForm: React.FC<TagsEditProps> = ({
  termId,
  termDetailsTags,
  isLoading,
  updateTermDetailsTags,
  searchTags,
  btnEditEl,
}) => {
  // Autocomplete
  type FilterOption = Omit<Tag, 'id'> & Partial<Tag>;
  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState<string>('');
  const filter = createFilterOptions<FilterOption>();

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      searchTags({ page: 1, size: 30, query: searchText }).then(
        response => {
          setLoading(false);
          setOptions(response.items);
        }
      );
    }, 500),
    [searchTags, setLoading, setOptions, searchText]
  );

  const getOptionLabel = React.useCallback((option: FilterOption) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

  const getFilterOptions = React.useCallback(
    (filterOptions, params) => {
      const filtered = filter(options, params);
      if (
        searchText !== '' &&
        !loading &&
        !options.find(
          option =>
            option.name.toLocaleLowerCase() ===
            searchText.toLocaleLowerCase()
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
        setSearchText(query);
      } else {
        setSearchText(''); // Clear input on select
      }
    },
    [setSearchText]
  );

  React.useEffect(() => {
    setLoading(autocompleteOpen);
    if (autocompleteOpen) {
      handleSearch();
    }
  }, [autocompleteOpen, searchText]);

  // Tags list
  type TermDetailsTagsFormType = {
    tagNameList: { name: string; important: boolean }[];
  };
  const methods = useForm<TermDetailsTagsFormType>({
    defaultValues: { tagNameList: [{ name: '', important: false }] },
  });
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'tagNameList',
  });

  const onOpen = (handleOpen: () => void) => () => {
    methods.reset({
      tagNameList: termDetailsTags?.map(tag => ({
        name: tag.name,
        important: tag.important,
      })),
    });
    handleOpen();
  };
  const initialFormState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setFormState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialFormState);

  const clearFormState = () => {
    setFormState(initialFormState);
    methods.reset();
  };

  const handleSubmit = (data: TermDetailsTagsFormType) => {
    updateTermDetailsTags({
      termId,
      tagsFormData: {
        tagNameList: compact([...data.tagNameList.map(tag => tag.name)]),
      },
    }).then(
      () => {
        setFormState({ ...initialFormState, isSuccessfulSubmit: true });
        clearFormState();
      },
      (response: Response) => {
        setFormState({
          ...initialFormState,
          error: response.statusText || 'Unable to update tags',
        });
      }
    );
  };

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    value: FilterOption | string | null
  ) => {
    if (!value) return;
    setSearchText(''); // Clear input on select
    append(typeof value === 'string' ? { name: value } : value);
  };

  const handleRemove = (index: number) => () => {
    remove(index);
  };

  const formTitle = (
    <Typography variant="h4" component="span">
      Edit Tags
    </Typography>
  );

  const formContent = () => (
    <>
      <Autocomplete
        fullWidth
        id="term-tag-add-name-search"
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
          <AppTextField
            {...params}
            ref={params.InputProps.ref}
            placeholder="Enter tag name…"
            customEndAdornment={{
              variant: 'loader',
              showAdornment: loading,
              position: { mr: 4 },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <OptionsContainer $isImportant={option.important}>
              <Typography variant="body1">
                {option.id ? (
                  option.name
                ) : (
                  <AutocompleteSuggestion
                    optionLabel="tag"
                    optionName={option.name}
                  />
                )}
              </Typography>
            </OptionsContainer>
          </li>
        )}
      />
      <FormProvider {...methods}>
        <form
          id="tags-create-form"
          onSubmit={methods.handleSubmit(handleSubmit)}
        >
          <Box sx={{ mt: 1 }}>
            {fields?.map((field, index) => (
              <TagItem
                sx={{ my: 0.5, mr: 0.5 }}
                key={field.id}
                label={field.name}
                important={field.important}
                removable
                onRemoveClick={handleRemove(index)}
              />
            ))}
          </Box>
        </form>
      </FormProvider>
    </>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="tags-create-form"
      color="primary"
      fullWidth
    >
      Save
    </AppButton>
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnEditEl, { onClick: onOpen(handleOpen) })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isLoading}
      errorText={error}
    />
  );
};

export default TagsEditForm;
