import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TermFormData,
  TermDetails,
  TermApiCreateTermRequest,
  TermApiUpdateTermRequest,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import { Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import NamespaceAutocompleteContainer from './NamespaceAutocomplete/NamespaceAutocompleteContainer';

interface TermsFormDialogProps {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
  term?: TermDetails;
  createTerm: (params: TermApiCreateTermRequest) => Promise<TermDetails>;
  updateTerm: (params: TermApiUpdateTermRequest) => Promise<TermDetails>;
}

const TermsForm: React.FC<TermsFormDialogProps> = ({
  term,
  btnCreateEl,
  isLoading,
  createTerm,
  updateTerm,
}) => {
  const getDefaultValues = React.useCallback(
    (): TermFormData => ({
      name: term?.name || '',
      namespaceName: term?.namespace?.name || '',
      definition: term?.definition || '',
    }),
    [term]
  );

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isValid },
  } = useForm<TermFormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  React.useEffect(() => {
    reset(getDefaultValues());
  }, [term]);

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = () => {
    setState(initialState);
    reset();
  };

  const onSubmit = (data: TermFormData) => {
    const parsedData = { ...data };
    (term && term.id
      ? updateTerm({
          termId: term.id,
          termFormData: parsedData,
        })
      : createTerm({ termFormData: parsedData })
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error: response.statusText || 'Unable to register term',
        });
      }
    );
  };

  const termFormTitle = (
    <Typography variant="h4" component="span">
      {term ? 'Edit ' : 'Add '}
      Term
    </Typography>
  );

  const termFormContent = () => (
    <form id="term-create-form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="subtitle2" fontSize="0.73rem">
        Select a term from the dictionary or create a new term.
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
            placeholder="Start enter the name"
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
        defaultValue={term?.namespace?.name}
        render={({ field }) => (
          <NamespaceAutocompleteContainer controllerProps={field} />
        )}
      />
      <Controller
        name="definition"
        control={control}
        render={({ field }) => (
          <AppTextField
            {...field}
            sx={{ mt: 1.25 }}
            label="Definition"
            placeholder="Term definition"
            multiline
            maxRows={4}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => setValue('definition', ''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
    </form>
  );

  const termFormActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="term-create-form"
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
      title={termFormTitle}
      renderContent={termFormContent}
      renderActions={termFormActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isLoading}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default TermsForm;
