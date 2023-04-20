import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { DataEntityTermFormData, TermRef } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import { DialogWrapper, AppButton } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { addDataEntityTerm } from 'redux/thunks';
import { getDataEntityAddTermStatuses } from 'redux/selectors';
import TermsAutocomplete from './TermsAutocomplete/TermsAutocomplete';

interface AddTermsFormProps {
  btnCreateEl: JSX.Element;
  dataEntityId: number;
}

const AddTermsForm: React.FC<AddTermsFormProps> = ({ btnCreateEl, dataEntityId }) => {
  const dispatch = useAppDispatch();

  const { isLoading: isTermAdding, isLoaded: isTermAdded } = useAppSelector(
    getDataEntityAddTermStatuses
  );

  const { handleSubmit, control, reset, formState } = useForm<DataEntityTermFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [selectedTerm, setSelectedTerm] = React.useState<TermRef | null>(null);

  const clearState = () => {
    setSelectedTerm(null);
    reset();
  };

  const onSubmit = (data: DataEntityTermFormData) => {
    dispatch(
      addDataEntityTerm({
        dataEntityId,
        dataEntityTermFormData: { termId: data.termId },
      })
    ).then(() => {
      clearState();
    });
  };

  const handleSetSelectedTerm = React.useCallback(
    (term: TermRef) => setSelectedTerm(term),
    [setSelectedTerm]
  );

  const termFormTitle = (
    <Typography variant='h4' component='span'>
      Add term
    </Typography>
  );

  const termFormContent = () => (
    <form id='add-term-form' onSubmit={handleSubmit(onSubmit)}>
      <Typography variant='subtitle2' fontSize='0.73rem'>
        Select a term from the dictionary.
      </Typography>
      <Controller
        name='termId'
        control={control}
        rules={{
          required: true,
        }}
        render={({ field }) => (
          <TermsAutocomplete field={field} setSelectedTerm={handleSetSelectedTerm} />
        )}
      />
      {selectedTerm && (
        <>
          <Grid container flexDirection='column' sx={{ mt: 2 }}>
            <Typography variant='body2' color='texts.secondary' component='span'>
              Namespace:
            </Typography>
            {selectedTerm.namespace.name}
          </Grid>
          <Grid container flexDirection='column' sx={{ mt: 2 }}>
            <Typography variant='body2' color='texts.secondary' component='span'>
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
      size='large'
      type='submit'
      form='add-term-form'
      color='primary'
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
      maxWidth='md'
      title={termFormTitle}
      renderContent={termFormContent}
      renderActions={termFormActionButtons}
      handleCloseSubmittedForm={isTermAdded}
      isLoading={isTermAdding}
      clearState={clearState}
    />
  );
};

export default AddTermsForm;
