import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  CollectorFormData,
  Collector,
  CollectorApiRegisterCollectorRequest,
  CollectorApiUpdateCollectorRequest,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import { Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { Asterisk } from 'components/Management/CollectorsList/CollectorForm/CollectorFormStyles';
import NamespaceAutocompleteContainer from './NamespaceAutocomplete/NamespaceAutocompleteContainer';

interface CollectorFormDialogProps {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
  collector?: Collector;
  registerCollector: (
    params: CollectorApiRegisterCollectorRequest
  ) => Promise<Collector>;
  updateCollector: (
    params: CollectorApiUpdateCollectorRequest
  ) => Promise<Collector>;
}

const CollectorForm: React.FC<CollectorFormDialogProps> = ({
  collector,
  btnCreateEl,
  isLoading,
  registerCollector,
  updateCollector,
}) => {
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

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = () => {
    setState(initialState);
    reset();
  };

  const onSubmit = (data: CollectorFormData) => {
    const parsedData = { ...data };
    (collector
      ? updateCollector({
          collectorId: collector.id,
          collectorUpdateFormData: parsedData,
        })
      : registerCollector({ collectorFormData: parsedData })
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error: response.statusText || 'Unable to register collector',
        });
      }
    );
  };

  const collectorFormTitle = (
    <Typography variant="h4" component="span">
      {collector ? 'Edit ' : 'Add '}
      Collector
    </Typography>
  );

  const collectorFormContent = () => (
    <form id="collector-create-form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="subtitle2" fontSize="0.73rem">
        Fields with the <Asterisk>*</Asterisk> symbol are required to save
        the Collector
      </Typography>
      <Controller
        name="name"
        control={control}
        rules={{
          required: true,
          validate: value => !!value.trim(),
        }}
        render={({ field }) => (
          <AppTextField
            {...field}
            sx={{ mt: 1.5 }}
            label="Name"
            placeholder="e.g. Data Tower"
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
        name="namespaceName"
        defaultValue={collector?.namespace?.name}
        render={({ field }) => (
          <NamespaceAutocompleteContainer controllerProps={field} />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <AppTextField
            {...field}
            sx={{ mt: 1.25 }}
            label="Description"
            placeholder="Collector description"
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
    <AppButton
      size="large"
      type="submit"
      form="collector-create-form"
      color="primary"
      fullWidth
      disabled={!isValid}
    >
      Save
    </AppButton>
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={collectorFormTitle}
      renderContent={collectorFormContent}
      renderActions={collectorFormActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isLoading}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default CollectorForm;
