import React, { useEffect, useMemo, useCallback, cloneElement } from 'react';
import {
  useCreateLookupTable,
  useUpdateLookupTable,
} from 'lib/hooks/api/masterData/lookupTables';
import { Controller, useForm } from 'react-hook-form';
import type { LookupTable, LookupTableFormData } from 'generated-sources';
import { useNavigate } from 'react-router-dom';
import { lookupTablesPath } from 'routes';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DialogWrapper,
  Input,
  Markdown,
  NamespaceAutocomplete,
} from 'components/shared/elements';

interface LookupTableFormProps {
  btnEl: React.JSX.Element;
  lookupTable?: LookupTable;
}

const LookupTableForm = ({ btnEl, lookupTable }: LookupTableFormProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    mutateAsync: addLookupTable,
    isSuccess: isCreated,
    isPending: isCreating,
  } = useCreateLookupTable();

  const {
    mutateAsync: editLookupTable,
    isSuccess: isUpdated,
    isPending: isUpdating,
  } = useUpdateLookupTable();

  const defaultValues = useMemo(
    () => ({
      name: lookupTable ? lookupTable.name : '',
      description: lookupTable ? lookupTable.description : '',
      namespaceName: lookupTable ? lookupTable.namespace.name : '',
    }),
    [lookupTable]
  );

  const { handleSubmit, control, reset, formState } = useForm<LookupTableFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  const onSubmit = useCallback(
    (data: LookupTableFormData) => {
      const mutation$ = lookupTable
        ? editLookupTable({
            lookupTableUpdateFormData: data,
            lookupTableId: lookupTable.tableId,
          })
        : addLookupTable({ lookupTableFormData: data });
      mutation$.then(_ => {
        reset();
        navigate(lookupTablesPath());
      });
    },
    [lookupTable]
  );

  const title = (
    <Typography variant='h4' component='span'>
      {lookupTable ? t('Edit') : t('Add')} {t('lookup table')}
    </Typography>
  );

  const formContent = () => (
    <form id='lookup-table-form' onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='name'
        control={control}
        defaultValue={defaultValues.name}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Grid container flexDirection='column' mt={1.25}>
            <Input {...field} variant='main-m' label={t('Table name')} />
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
        control={control}
        name='namespaceName'
        disabled={!!lookupTable}
        rules={{ required: !lookupTable }}
        render={({ field }) => <NamespaceAutocomplete controllerProps={field} />}
      />
    </form>
  );

  const actionButton = () => (
    <Button
      text={lookupTable ? t('Save lookup table') : t('Add lookup table')}
      buttonType='main-lg'
      type='submit'
      form='lookup-table-form'
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
      handleCloseSubmittedForm={isUpdated || isCreated}
      isLoading={isUpdating || isCreating}
      clearState={reset}
      formSubmitHandler={handleSubmit(onSubmit)}
    />
  );
};

export default LookupTableForm;
