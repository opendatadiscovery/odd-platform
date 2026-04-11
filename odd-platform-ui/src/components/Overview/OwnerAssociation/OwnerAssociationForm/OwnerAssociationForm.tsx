import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';
import type { ControllerRenderProps } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';
import type {
  AutocompleteInputChangeReason,
  FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import { useTranslation } from 'react-i18next';
import { getIdentity } from 'redux/selectors';
import type { Owner, OwnerFormData } from 'generated-sources';
import { OwnerAssociationRequestStatus } from 'generated-sources';
import { ClearIcon, UserSyncIcon } from 'components/shared/icons';
import { AutocompleteSuggestion, Button, Input } from 'components/shared/elements';
import { fetchIdentity, fetchOwnersList } from 'redux/thunks';
import { useCreateOwnerAssociationRequest, usePermissions } from 'lib/hooks';
import { setProfileOwnerName } from 'redux/slices/profile.slice';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import * as S from './OwnerAssociationFormStyles';

const OwnerAssociationForm: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isAllowedTo: associateImmediately } = usePermissions();

  const identity = useAppSelector(getIdentity);
  const { mutateAsync: createOwnerAssociationRequest, isPending: isRequestCreating } =
    useCreateOwnerAssociationRequest();

  const searchOwners = fetchOwnersList;
  const methods = useForm<OwnerFormData>({
    mode: 'onChange',
    defaultValues: { name: '' },
  });
  const [possibleOwners, setPossibleOwners] = useState<Owner[]>([]);
  type FilterOption = Omit<Owner, 'id' | 'name'> & Partial<Owner>;
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsSearchText, setOptionsSearchText] = useState('');
  const ownersFilter = createFilterOptions<FilterOption>();

  const handleOwnersSearch = useCallback(
    useDebouncedCallback(() => {
      setOptionsLoading(true);
      dispatch(
        searchOwners({
          page: 1,
          size: 30,
          query: optionsSearchText,
          allowedForSync: true,
        })
      )
        .unwrap()
        .then(({ items }) => {
          setOptionsLoading(false);
          setOptions(items);
        });
    }, 500),
    [searchOwners, setOptionsLoading, setOptions, optionsSearchText]
  );

  const onSearchInputChange = useCallback(
    (
      _: React.ChangeEvent<unknown>,
      query: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') {
        setOptionsSearchText(query);
      }
    },
    [setOptionsSearchText]
  );

  const getFilterOptions = (
    filterOptions: FilterOption[],
    params: FilterOptionsState<FilterOption>
  ) => {
    const filtered = ownersFilter(filterOptions, params);
    if (
      optionsSearchText !== '' &&
      !optionsLoading &&
      !filterOptions.some(option => option.name === optionsSearchText)
    ) {
      return [...filtered, { name: optionsSearchText }];
    }
    return filtered;
  };

  const getOptionLabel = useCallback((option: FilterOption | string) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

  const onAutocompleteChange = (
    field: ControllerRenderProps<Omit<OwnerFormData, 'roles'>>,
    option: FilterOption | string | null
  ) => {
    if (!option || typeof option === 'string') {
      field.onChange(option);
    } else {
      field.onChange(option.name);
    }
  };

  useEffect(() => {
    setOptionsLoading(autocompleteOpen);
    if (autocompleteOpen) {
      handleOwnersSearch();
    }
  }, [autocompleteOpen, optionsSearchText]);

  const onSubmit = async (data: OwnerFormData) => {
    const { status, ownerName } = await createOwnerAssociationRequest({
      ownerFormData: data,
    });
    if (associateImmediately && status === OwnerAssociationRequestStatus.APPROVED) {
      dispatch(setProfileOwnerName(ownerName));
    }
    dispatch(fetchIdentity());
  };

  useEffect(() => {
    if (!identity?.username) return;

    const params = { page: 1, size: 30, query: identity?.username, allowedForSync: true };
    const ownersPromise = dispatch(searchOwners(params));

    ownersPromise.unwrap().then(({ items }) => setPossibleOwners(items));

    return () => {
      ownersPromise.abort();
    };
  }, [identity?.username]);

  return (
    <Grid container>
      <Grid item xs={12} container justifyContent='center'>
        <UserSyncIcon sx={{ width: '76px', height: '41px' }} />
      </Grid>
      <Grid item xs={12} container alignItems='center' sx={{ mt: 2 }} direction='column'>
        <Typography variant='h3'>
          {identity?.username ? (
            <>
              {t('Hi')} {identity?.username}.
            </>
          ) : null}{' '}
          {t('Sync your account with existing owner')}
        </Typography>
        <Typography variant='subtitle2'>
          {t('This will allow you to bind existing entities in your account.')}
        </Typography>
      </Grid>
      <Grid item xs={12} container alignItems='center' direction='column'>
        <S.FormContainer
          id='owner-connect-form'
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <Controller
            name='name'
            control={methods.control}
            defaultValue=''
            rules={{ required: true }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                fullWidth
                id='owners-name-search'
                open={autocompleteOpen}
                onOpen={() => setAutocompleteOpen(true)}
                onClose={() => setAutocompleteOpen(false)}
                onChange={(_, data) => onAutocompleteChange(field, data)}
                onInputChange={onSearchInputChange}
                getOptionLabel={getOptionLabel}
                options={options}
                filterOptions={getFilterOptions}
                loading={optionsLoading}
                isOptionEqualToValue={(option, value) => option.name === value.name}
                handleHomeEndKeys
                selectOnFocus
                blurOnSelect
                freeSolo
                clearIcon={<ClearIcon />}
                renderInput={params => (
                  <>
                    <Input
                      variant='main-m'
                      inputContainerRef={params.InputProps.ref}
                      inputProps={params.inputProps}
                      name='name'
                      label={t('Owner name')}
                      placeholder={t('Search name')}
                      isLoading={optionsLoading}
                    />
                    {possibleOwners.length ? (
                      <S.SuggestedOwnersContainer
                        item
                        xs={12}
                        container
                        direction='column'
                        alignItems='flex-start'
                      >
                        <Typography variant='subtitle2'>{t("Maybe it's you")}</Typography>
                        {possibleOwners.map(owner => (
                          <S.SuggestedOwnerItem
                            key={owner.id}
                            variant='body1'
                            onClick={() => field.onChange(owner.name)}
                          >
                            {owner.name}
                          </S.SuggestedOwnerItem>
                        ))}
                      </S.SuggestedOwnersContainer>
                    ) : null}
                  </>
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography variant='body2'>
                      {option.id ? (
                        option.name
                      ) : (
                        <AutocompleteSuggestion
                          optionLabel='owner'
                          optionName={option.name}
                        />
                      )}
                    </Typography>
                  </li>
                )}
              />
            )}
          />
          <Button
            text={associateImmediately ? t('Associate') : t('Send a request')}
            sx={{ mt: 2 }}
            buttonType='main-lg'
            type='submit'
            form='owner-connect-form'
            fullWidth
            disabled={!methods.formState.isValid}
            isLoading={isRequestCreating}
          />
        </S.FormContainer>
      </Grid>
    </Grid>
  );
};

export default OwnerAssociationForm;
