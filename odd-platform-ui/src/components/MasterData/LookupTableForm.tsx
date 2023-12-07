import React, { useEffect, useMemo, useCallback, cloneElement } from 'react';
import { useCreateLookupTable } from 'lib/hooks/api/lookupTables';
import { Controller, useForm } from 'react-hook-form';
import type { LookupTableFormData } from 'generated-sources';
import { useNavigate } from 'react-router-dom';
import { lookupTablesPath } from 'routes';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button, DialogWrapper, Input, Markdown } from 'components/shared/elements';

interface LookupTableFormProps {
  btnCreateEl: React.JSX.Element;
}

const LookupTableForm = ({ btnCreateEl }: LookupTableFormProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    mutateAsync: addLookupTable,
    isSuccess: isCreated,
    isPending: isCreating,
  } = useCreateLookupTable();

  const defaultValues = useMemo(
    () => ({
      tableName: '',
      description: '',
      namespaceName: '',
    }),
    []
  );

  const { handleSubmit, control, reset, formState } = useForm<LookupTableFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  const onSubmit = useCallback((data: LookupTableFormData) => {
    addLookupTable(data).then(_ => {
      reset();
      navigate(lookupTablesPath());
    });
  }, []);

  const title = (
    <Typography variant='h4' component='span'>
      {t('Add')} {t('lookup table')}
    </Typography>
  );

  const formContent = () => (
    <form id='lookup-table-form' onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='tableName'
        control={control}
        defaultValue={defaultValues.tableName}
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
    </form>
  );

  const actionButton = () => (
    <Button
      text={t('Add lookup table')}
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
      renderOpenBtn={({ handleOpen }) =>
        cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={title}
      renderContent={formContent}
      renderActions={actionButton}
      handleCloseSubmittedForm={isCreated}
      isLoading={isCreating}
      clearState={reset}
      formSubmitHandler={handleSubmit(onSubmit)}
    />
  );
};

export default LookupTableForm;
