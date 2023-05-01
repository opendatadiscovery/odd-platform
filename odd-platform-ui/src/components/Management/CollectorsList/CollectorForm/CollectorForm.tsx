import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { Collector, CollectorFormData } from 'generated-sources';
import { registerCollector, updateCollector } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getCollectorCreatingStatuses,
  getCollectorsUpdatingStatuses,
} from 'redux/selectors';
import { Typography } from '@mui/material';
import {
  Button,
  AppInput,
  NamespaceAutocomplete,
  DialogWrapper,
} from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { Asterisk } from './CollectorFormStyles';

interface CollectorFormDialogProps {
  btnCreateEl: JSX.Element;
  collector?: Collector;
}

const CollectorForm: React.FC<CollectorFormDialogProps> = ({
  collector,
  btnCreateEl,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading: isCollectorCreating, isLoaded: isCollectorCreated } = useAppSelector(
    getCollectorCreatingStatuses
  );
  const { isLoading: isCollectorUpdating, isLoaded: isCollectorUpdated } = useAppSelector(
    getCollectorsUpdatingStatuses
  );
  const getDefaultValues = React.useCallback(
    (): CollectorFormData => ({
      name: collector?.name || '',
      namespaceName: collector?.namespace?.name || '',
      description: collector?.description || '',
    }),
    [collector]
  );

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isValid },
  } = useForm<CollectorFormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  React.useEffect(() => {
    reset(getDefaultValues());
  }, [collector]);

  const clearState = () => {
    reset();
  };

  const onSubmit = (data: CollectorFormData) => {
    const parsedData = { ...data };
    (collector
      ? dispatch(
          updateCollector({
            collectorId: collector.id,
            collectorFormData: parsedData,
          })
        )
      : dispatch(registerCollector({ collectorFormData: parsedData }))
    ).then(() => {
      clearState();
    });
  };

  const collectorFormTitle = (
    <Typography variant='h4' component='span'>
      {collector ? 'Edit ' : 'Add '}
      Collector
    </Typography>
  );

  const collectorFormContent = () => (
    <form id='collector-create-form' onSubmit={handleSubmit(onSubmit)}>
      <Typography variant='subtitle2' fontSize='0.73rem'>
        Fields with the <Asterisk>*</Asterisk> symbol are required to save the Collector
      </Typography>
      <Controller
        name='name'
        control={control}
        rules={{
          required: true,
          validate: value => !!value.trim(),
        }}
        render={({ field }) => (
          <AppInput
            {...field}
            sx={{ mt: 1.5 }}
            label='Name'
            placeholder='e.g. Data Tower'
            required
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
      <Controller
        control={control}
        name='namespaceName'
        defaultValue={collector?.namespace?.name}
        render={({ field }) => <NamespaceAutocomplete controllerProps={field} />}
      />
      <Controller
        name='description'
        control={control}
        render={({ field }) => (
          <AppInput
            {...field}
            sx={{ mt: 1.25 }}
            label='Description'
            placeholder='Collector description'
            multiline
            maxRows={4}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => setValue('description', ''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
    </form>
  );

  const collectorFormActionButtons = () => (
    <Button
      text='Save'
      type='submit'
      form='collector-create-form'
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
      title={collectorFormTitle}
      renderContent={collectorFormContent}
      renderActions={collectorFormActionButtons}
      handleCloseSubmittedForm={collector ? isCollectorUpdated : isCollectorCreated}
      isLoading={collector ? isCollectorUpdating : isCollectorCreating}
      clearState={clearState}
    />
  );
};

export default CollectorForm;
