import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  DataEntityApiAddTermToDataEntityRequest,
  DataEntityTermFormData,
  TermRef,
} from 'generated-sources';
import { useHistory } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import TermsAutocompleteContainer from './TermsAutocomplete/TermsAutocompleteContainer';

interface AddTermsFormProps {
  btnCreateEl: JSX.Element;
  dataEntityId: number;
  isLoading: boolean;
  createDataEntityTerm: (
    params: DataEntityApiAddTermToDataEntityRequest
  ) => Promise<TermRef>;
}

const AddTermsForm: React.FC<AddTermsFormProps> = ({
  btnCreateEl,
  isLoading,
  createDataEntityTerm,
  dataEntityId,
}) => {
  const { handleSubmit, control, reset, setValue, formState, watch } =
    useForm<DataEntityTermFormData>({
      mode: 'onChange',
      reValidateMode: 'onChange',
    });

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = () => {
    setState(initialState);
    reset();
  };

  const onSubmit = (data: DataEntityTermFormData) => {
    console.log('data', data);
    createDataEntityTerm({
      dataEntityId,
      dataEntityTermFormData: { termId: data.termId },
    }).then(
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

  const [selectedTerm, setSelectedTerm] = React.useState<TermRef | null>(
    null
  );

  const handleSetSelectedTerm = React.useCallback(
    (term: TermRef) => setSelectedTerm(term),
    [setSelectedTerm]
  );

  const termFormTitle = (
    <Typography variant="h4" component="span">
      Add term
    </Typography>
  );

  const termFormContent = () => (
    <form id="add-term-form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="subtitle2" fontSize="0.73rem">
        Select a term from the dictionary.
      </Typography>
      <Controller
        name="termId"
        control={control}
        rules={{
          required: true,
        }}
        render={({ field }) => (
          <TermsAutocompleteContainer
            field={field}
            setSelectedTerm={handleSetSelectedTerm}
          />
        )}
      />
      {selectedTerm && (
        <>
          <Grid
            container
            flexDirection="column"
            sx={{ mt: 2 }}
            display={selectedTerm.namespace?.name ? '' : 'none'}
          >
            <Typography
              variant="body2"
              color="texts.secondary"
              component="span"
            >
              Namespace:
            </Typography>
            {selectedTerm.namespace?.name}
          </Grid>
          <Grid
            container
            flexDirection="column"
            sx={{ mt: 2 }}
            display={selectedTerm.definition ? '' : 'none'}
          >
            <Typography
              variant="body2"
              color="texts.secondary"
              component="span"
            >
              Definition:
            </Typography>
            {selectedTerm.definition}
          </Grid>
        </>
      )}
    </form>
  );

  const termFormActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="add-term-form"
      color="primary"
      fullWidth
      disabled={!formState.isValid}
    >
      Add term
    </AppButton>
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      maxWidth="sm"
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

export default AddTermsForm;
