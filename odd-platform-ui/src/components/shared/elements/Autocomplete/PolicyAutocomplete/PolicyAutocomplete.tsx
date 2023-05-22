import React, { type HTMLAttributes } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Autocomplete,
  type AutocompleteRenderInputParams,
  type Theme,
  Typography,
} from '@mui/material';
import type { Policy, RoleFormData } from 'generated-sources';
import {
  type AutocompleteInputChangeReason,
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchPolicyList } from 'redux/thunks';
import { type UseFieldArrayAppend } from 'react-hook-form/dist/types/fieldArray';
import { type SxProps } from '@mui/system';
import Input from 'components/shared/elements/Input/Input';

interface PolicyAutocompleteProps {
  append: UseFieldArrayAppend<RoleFormData, 'policies'>;
  sx?: SxProps<Theme>;
}

const PolicyAutocomplete: React.FC<PolicyAutocompleteProps> = ({ append, sx }) => {
  const dispatch = useAppDispatch();
  const searchPolicies = fetchPolicyList;

  type PolicyFilterOption = Omit<Policy, 'id'> & Partial<Pick<Policy, 'id'>>;
  const [policyOptions, setPolicyOptions] = React.useState<PolicyFilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [policiesLoading, setPoliciesLoading] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const policiesFilter = createFilterOptions<PolicyFilterOption>();

  const handlePoliciesSearch = React.useCallback(
    useDebouncedCallback(() => {
      setPoliciesLoading(true);
      dispatch(searchPolicies({ page: 1, size: 30, query }))
        .unwrap()
        .then(({ items }) => {
          setPoliciesLoading(false);
          setPolicyOptions(items);
        });
    }, 500),
    [searchPolicies, setPoliciesLoading, setPolicyOptions, query]
  );

  const onPoliciesSearchInputChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      inputQuery: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') setQuery(inputQuery);
      else setQuery('');
    },
    [setQuery]
  );

  const getPolicyFilterOptions = (
    filterOptions: PolicyFilterOption[],
    params: FilterOptionsState<PolicyFilterOption>
  ) => policiesFilter(filterOptions, params);

  React.useEffect(() => {
    setPoliciesLoading(autocompleteOpen);
    if (autocompleteOpen) handlePoliciesSearch();
  }, [autocompleteOpen, handlePoliciesSearch]);

  const getOptionLabel = React.useCallback((option: PolicyFilterOption | string) => {
    if (typeof option === 'string') return option;
    if ('name' in option && option.name) return option.name;
    return '';
  }, []);

  const onAutocompleteChange = (
    _: React.SyntheticEvent,
    value: null | string | PolicyFilterOption
  ): void => {
    if (value === null) return;
    if (typeof value === 'string') return;

    const isPolicy = (policy: Policy | PolicyFilterOption): policy is Policy =>
      'id' in policy;

    if (isPolicy(value)) {
      setQuery('');
      append(value);
    }
  };

  const handleOpen = () => setAutocompleteOpen(true);
  const handleClose = () => setAutocompleteOpen(false);

  const isOptionEqualToValue = (option: PolicyFilterOption, value: PolicyFilterOption) =>
    option.name === value.name;

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <Input
      variant='main-m'
      inputContainerRef={params.InputProps.ref}
      inputProps={params.inputProps}
      label='Policy'
      placeholder='Search by name…'
      isLoading={policiesLoading}
    />
  );

  const renderOption = (
    props: HTMLAttributes<HTMLLIElement>,
    option: PolicyFilterOption
  ) => (
    <li {...props}>
      <Typography variant='body2'>{option.name}</Typography>
    </li>
  );

  return (
    <Autocomplete
      sx={sx}
      fullWidth
      value={{ name: query }}
      open={autocompleteOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      onChange={onAutocompleteChange}
      onInputChange={onPoliciesSearchInputChange}
      getOptionLabel={getOptionLabel}
      options={policyOptions}
      filterOptions={getPolicyFilterOptions}
      loading={policiesLoading}
      isOptionEqualToValue={isOptionEqualToValue}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      freeSolo
      clearIcon={<ClearIcon />}
      renderInput={renderInput}
      renderOption={renderOption}
    />
  );
};

export default PolicyAutocomplete;
