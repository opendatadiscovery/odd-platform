import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import type { QueryExampleDetails, QueryExampleFormData } from 'generated-sources';
import {
  useCreateQueryExample,
  useUpdateQueryExample,
} from 'lib/hooks/api/dataModelling/queryExamples';
import React, { cloneElement, useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import { Button, DialogWrapper, Markdown } from 'components/shared/elements';

interface QueryExampleFormProps {
  btnCreateEl: JSX.Element;
  queryExample?: QueryExampleDetails;
}

const QueryExampleForm = ({ queryExample, btnCreateEl }: QueryExampleFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { queryExamplePath } = useAppPaths();
  const {
    mutateAsync: addQueryExample,
    isSuccess: isCreated,
    isPending: isCreating,
  } = useCreateQueryExample();
  const {
    mutateAsync: updateQueryExample,
    isSuccess: isUpdated,
    isPending: isUpdating,
  } = useUpdateQueryExample();

  const defaultValues = useMemo(
    () => ({
      definition: queryExample?.definition ?? '',
      query: queryExample?.query ?? '',
    }),
    [queryExample]
  );

  const { handleSubmit, control, reset, formState } = useForm<QueryExampleFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  const onSubmit = useCallback(
    (data: QueryExampleFormData) => {
      const mutation$ = queryExample
        ? updateQueryExample({
            queryExampleFormData: data,
            exampleId: queryExample.id,
          })
        : addQueryExample({ queryExampleFormData: data });

      mutation$.then(qe => {
        reset();
        navigate(queryExamplePath(qe.id));
      });
    },
    [queryExample]
  );

  const title = (
    <Typography variant='h4' component='span'>
      {queryExample ? t('Edit') : t('Add')} {t('query example')}
    </Typography>
  );

  const formContent = () => (
    <form id='query-example-form' onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='definition'
        control={control}
        defaultValue={defaultValues.definition}
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
      <Controller
        name='query'
        control={control}
        defaultValue={defaultValues?.query}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Grid container flexDirection='column' mt={1.25}>
            <Typography
              fontWeight={500}
              variant='body2'
              color='input.label.color'
              mb={0.125}
            >
              {t('Query')}
            </Typography>
            <Markdown {...field} editor height={200} />
          </Grid>
        )}
      />
    </form>
  );

  const actionButton = () => (
    <Button
      text={queryExample ? t('Save query example') : t('Add query example')}
      buttonType='main-lg'
      type='submit'
      form='query-example-form'
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
      title={title}
      renderContent={formContent}
      renderActions={actionButton}
      handleCloseSubmittedForm={queryExample ? isUpdated : isCreated}
      isLoading={queryExample ? isUpdating : isCreating}
      clearState={reset}
      formSubmitHandler={handleSubmit(onSubmit)}
    />
  );
};

export default QueryExampleForm;
