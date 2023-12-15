import React, { cloneElement, useCallback, useEffect, useMemo } from 'react';
import type { LookupTableFieldFormData } from 'generated-sources';
import { LookupTableFieldType } from 'generated-sources';
import { Controller, useForm } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCreateLookupTableDefinition } from 'lib/hooks';
import { useNavigate } from 'react-router-dom';
import { dataEntityDetailsPath, useDataEntityRouteParams } from 'routes';
import isEmpty from 'lodash/isEmpty';
import {
  AppMenuItem,
  AppSelect,
  Button,
  DialogWrapper,
  Input,
  Markdown,
} from 'components/shared/elements';
import { ErrorMessage } from '@hookform/error-message';
import parse from 'html-react-parser';

interface ColumnFormProps {
  btnEl: React.JSX.Element;
  lookupTableId: number;
}

const ColumnForm = ({ btnEl, lookupTableId }: ColumnFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dataEntityId } = useDataEntityRouteParams();
  const {
    mutateAsync: addColumn,
    isSuccess,
    isPending,
  } = useCreateLookupTableDefinition();

  const defaultValues = useMemo<LookupTableFieldFormData>(
    () => ({
      name: '',
      description: '',
      fieldType: LookupTableFieldType.VARCHAR,
    }),
    []
  );

  const { handleSubmit, control, reset, formState } = useForm<LookupTableFieldFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const onSubmit = useCallback(
    async (data: LookupTableFieldFormData) => {
      addColumn({ lookupTableId, lookupTableFieldFormData: [data] }).then(() => {
        reset();
        navigate(dataEntityDetailsPath(dataEntityId, 'structure'));
      });
    },
    [addColumn, lookupTableId, dataEntityId]
  );

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  const title = (
    <Typography variant='h4' component='span'>
      {t('Add column')}
    </Typography>
  );

  const formContent = () => (
    <form id='lookup-table-definition-form' onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='name'
        control={control}
        defaultValue={defaultValues.name}
        rules={{
          required: true,
          validate: value => !!value.trim(),
          pattern: {
            value: /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/, // postgresql table name pattern
            message: `Name must apply the postgresql column name conventions: /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$ <br />
                1. Starts with a letter or an underscore.<br />
                2. Can be followed by letters, numbers, or underscores.<br />
                3. Has a maximum length of 63 characters.<br />`,
          },
        }}
        render={({ field }) => (
          <Grid container flexDirection='column' mt={1.25}>
            <Input {...field} variant='main-m' label={t('Table name')} />
            <ErrorMessage
              errors={formState.errors}
              name='name'
              render={({ message }) => (
                <Typography mt={0.5} variant='body2' color='warning.main'>
                  {parse(message || '')}
                </Typography>
              )}
            />
          </Grid>
        )}
      />
      <Controller
        name='description'
        control={control}
        defaultValue={defaultValues.description}
        render={({ field }) => (
          <Grid container flexDirection='column' mt={1.25}>
            <Typography
              fontWeight={500}
              variant='body2'
              color='input.label.color'
              mb={0.125}
            >
              {t('Description')}
            </Typography>
            <Markdown
              value={field.value ?? ''}
              onChange={value => field.onChange(value)}
              editor
              height={200}
            />
          </Grid>
        )}
      />
      <Controller
        name='fieldType'
        control={control}
        rules={{ required: true, validate: val => !isEmpty(val) }}
        render={({ field }) => (
          <AppSelect
            {...field}
            label='Data type'
            sx={{ mt: 1.5 }}
            renderValue={value => value as LookupTableFieldType}
          >
            {Object.values(LookupTableFieldType).map(type => (
              <AppMenuItem key={type} value={type} maxWidth={undefined}>
                {type}
              </AppMenuItem>
            ))}
          </AppSelect>
        )}
      />
    </form>
  );

  const actionButton = () => (
    <Button
      text={t('Save')}
      buttonType='main-lg'
      type='submit'
      form='lookup-table-definition-form'
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      maxWidth='xl'
      renderOpenBtn={({ handleOpen }) => cloneElement(btnEl, { onClick: handleOpen })}
      title={title}
      renderContent={formContent}
      renderActions={actionButton}
      handleCloseSubmittedForm={isSuccess}
      isLoading={isPending}
      clearState={reset}
      formSubmitHandler={handleSubmit(onSubmit)}
    />
  );
};

export default ColumnForm;
