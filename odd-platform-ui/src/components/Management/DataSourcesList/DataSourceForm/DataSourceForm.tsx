import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { DataSource, DataSourceFormData } from 'generated-sources';
import { registerDataSource, updateDataSource } from 'redux/thunks';
import {
  getDatasourceCreatingStatuses,
  getDatasourceUpdatingStatuses,
} from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  Button,
  DialogWrapper,
  Input,
  NamespaceAutocomplete,
} from 'components/shared/elements';
import { Asterisk } from './DataSourceFormStyles';

interface DataSourceFormDialogProps {
  btnCreateEl: JSX.Element;
  dataSource?: DataSource;
}

export type DataSourceFormDataValues = Omit<DataSourceFormData, 'pullingInterval'> & {
  pullingInterval: { value?: number; format: string };
};

const DataSourceForm: React.FC<DataSourceFormDialogProps> = ({
  dataSource,
  btnCreateEl,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isLoading: isDataSourceCreating, isLoaded: isDataSourceCreated } =
    useAppSelector(getDatasourceCreatingStatuses);
  const { isLoading: isDataSourceUpdating, isLoaded: isDataSourceUpdated } =
    useAppSelector(getDatasourceUpdatingStatuses);

  const getDefaultValues = React.useCallback(
    (): DataSourceFormData => ({
      name: dataSource?.name || '',
      oddrn: dataSource?.oddrn || '',
      namespaceName: dataSource?.namespace?.name || '',
      description: dataSource?.description || '',
    }),
    [dataSource]
  );

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid },
  } = useForm<DataSourceFormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  React.useEffect(() => {
    reset(getDefaultValues());
  }, [dataSource]);

  const clearState = () => {
    reset();
  };

  const onSubmit = (data: DataSourceFormData) => {
    (dataSource
      ? dispatch(
          updateDataSource({
            dataSourceId: dataSource.id,
            dataSourceUpdateFormData: data,
          })
        )
      : dispatch(registerDataSource({ dataSourceFormData: data }))
    ).then(() => {
      clearState();
    });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {dataSource ? t('Edit datasource') : t('Add datasource')}
    </Typography>
  );

  const formContent = () => (
    <form id='datasource-create-form' onSubmit={handleSubmit(onSubmit)}>
      <Typography variant='subtitle2' fontSize='0.73rem'>
        {t('Fields with the')} <Asterisk>*</Asterisk>{' '}
        {t('symbol are required to save the datasource')}
      </Typography>
      <Controller
        name='name'
        control={control}
        rules={{
          required: true,
          validate: value => !!value.trim(),
        }}
        render={({ field }) => (
          <Input {...field} variant='main-m' sx={{ mt: 1.5 }} label={t('Name')} />
        )}
      />
      <Controller
        name='oddrn'
        shouldUnregister
        control={control}
        rules={{
          required: true,
          validate: value => !!value?.trim(),
        }}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            sx={{ mt: 1.5 }}
            label='ODDRN'
            disabled={!!dataSource?.oddrn}
          />
        )}
      />
      <Controller
        control={control}
        name='namespaceName'
        defaultValue={dataSource?.namespace?.name}
        render={({ field }) => <NamespaceAutocomplete controllerProps={field} />}
      />
      <Controller
        name='description'
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            sx={{ mt: 1.25 }}
            label={t('Description')}
            placeholder={t('Datasource description')}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <Button
      text={t('Save')}
      type='submit'
      form='datasource-create-form'
      buttonType='main-lg'
      fullWidth
      disabled={!isValid}
    />
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={dataSource ? isDataSourceUpdated : isDataSourceCreated}
      isLoading={dataSource ? isDataSourceUpdating : isDataSourceCreating}
      clearState={clearState}
    />
  );
};

export default DataSourceForm;
