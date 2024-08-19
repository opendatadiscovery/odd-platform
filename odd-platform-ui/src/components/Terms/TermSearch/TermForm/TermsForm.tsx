import React, { cloneElement, type FC, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, Alert,IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TermDetails, TermFormData } from 'generated-sources';
import {
  Button,
  DialogWrapper,
  Input,
  Markdown,
  NamespaceAutocomplete,
} from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createTerm, updateTerm, fetchTermsSearchResults } from 'redux/thunks';
import {
  getTermCreatingStatuses,
  getTermDetails,
  getTermUpdatingStatuses,
  getTermSearchResults,
  getTermSearchId,
  getTermSearchFacetsSynced,
} from 'redux/selectors';
import { termDetailsPath, useTermsRouteParams } from 'routes';
import { useQueryClient } from '@tanstack/react-query';

interface TermsFormDialogProps {
  btnCreateEl: JSX.Element;
}

const TermsForm: FC<TermsFormDialogProps> = ({ btnCreateEl }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { termId } = useTermsRouteParams();

  const term = useAppSelector(getTermDetails(termId));
  const { isLoading: isTermCreating, isLoaded: isTermCreated } = useAppSelector(
    getTermCreatingStatuses
  );
  const { isLoading: isTermUpdating, isLoaded: isTermUpdated } = useAppSelector(
    getTermUpdatingStatuses
  );

  const searchId = useAppSelector(getTermSearchId);
  const isTermSearchFacetsSynced = useAppSelector(getTermSearchFacetsSynced);
  const existingTerms = useAppSelector(getTermSearchResults);

  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => ({
      name: term?.name ?? '',
      namespaceName: term?.namespace?.name ?? '',
      definition: term?.definition ?? '',
    }),
    [term]
  );

  const { handleSubmit, control, reset, formState } = useForm<TermFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (searchId && isTermSearchFacetsSynced) {
      dispatch(fetchTermsSearchResults({ searchId, page: 1, size: 1000 }));
    }
  }, [dispatch, searchId, isTermSearchFacetsSynced]);

  const clearState = () => {
    reset();
    setError(null);
  };

  const onSubmit = (data: TermFormData) => {
    const duplicateTerm = existingTerms.find(
      (existingTerm: TermDetails) =>
        existingTerm.name === data.name &&
        existingTerm.namespace.name === data.namespaceName
    );

    if (duplicateTerm) {
      setError('A term with the same name already exists in this namespace.');
      return;
    }

    const parsedData = { ...data };
    (term && term.id
      ? dispatch(updateTerm({ termId: term.id, termFormData: parsedData }))
      : dispatch(createTerm({ termFormData: parsedData }))
    )
      .unwrap()
      .then(async (response: TermDetails) => {
        await queryClient.invalidateQueries({
          queryKey: ['term', termId],
        });
        clearState();
        navigate(termDetailsPath(response.id));
      });
  };

  const termFormTitle = (
    <Typography variant='h4' component='span'>
      {term?.id ? t('Edit') : t('Add')} {t('term')}
    </Typography>
  );

  const termFormContent = () => (
    <form id='term-create-form' onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, alignItems: 'center' }}
          action={
            <Typography
              component="button"
              onClick={() => setError(null)}
              sx={{
                fontSize: '1.1rem',
                color: 'inherit',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                marginLeft: 2,
                lineHeight: '1.6rem',
              }}
            >
              ×
            </Typography>
          }
        >
          {error}
        </Alert>
      )}
      <Controller
        name='name'
        control={control}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            label={t('Name')}
            placeholder={t('Start enter the name')}
          />
        )}
      />
      <Controller
        control={control}
        name='namespaceName'
        defaultValue={term?.namespace?.name}
        rules={{ required: true }}
        render={({ field }) => <NamespaceAutocomplete controllerProps={field} />}
      />
      <Controller
        name='definition'
        control={control}
        defaultValue={term?.definition}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Grid container flexDirection='column' mt={1.25}>
            <Typography
              fontWeight={500}
              variant='body2'
              color='input.label.color'
              mb={0.125}
            >
              {t('Definition')}
            </Typography>
            <Markdown {...field} editor height={200} />
          </Grid>
        )}
      />
    </form>
  );

  const termFormActionButtons = () => (
    <Button
      text={term?.id ? t('Save term') : t('Add term')}
      buttonType='main-lg'
      type='submit'
      form='term-create-form'
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      maxWidth='xl'
      renderOpenBtn={({ handleOpen }) =>
        cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={termFormTitle}
      renderContent={termFormContent}
      renderActions={termFormActionButtons}
      handleCloseSubmittedForm={term?.id ? isTermUpdated : isTermCreated}
      isLoading={term?.id ? isTermUpdating : isTermCreating}
      clearState={clearState}
      formSubmitHandler={handleSubmit(onSubmit)}
    />
  );
};

export default TermsForm;
