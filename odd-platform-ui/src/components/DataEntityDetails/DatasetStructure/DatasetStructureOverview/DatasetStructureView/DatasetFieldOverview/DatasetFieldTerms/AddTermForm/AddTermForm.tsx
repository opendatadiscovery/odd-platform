import React, { type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type {
  DataEntityTermFormData,
  TermRef,
  DatasetFieldTermFormData,
} from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import { Button, DialogWrapper, TermsAutocomplete } from 'components/shared/elements';
import { useAddDatasetFieldTerm } from 'lib/hooks';

interface AddTermFormProps {
  openBtnEl: JSX.Element;
  datasetFieldId: number;
  handleAddTerm: (term: TermRef) => void;
}

const AddTermForm: FC<AddTermFormProps> = ({
  openBtnEl,
  datasetFieldId,
  handleAddTerm,
}) => {
  const { isLoading, isSuccess, mutateAsync: addTerm } = useAddDatasetFieldTerm();

  const { handleSubmit, control, reset, formState } = useForm<DatasetFieldTermFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [selectedTerm, setSelectedTerm] = React.useState<TermRef | null>(null);

  const clearState = () => {
    setSelectedTerm(null);
    reset();
  };

  const onSubmit = ({ termId }: DataEntityTermFormData) => {
    addTerm({ datasetFieldId, termId }).then(term => {
      handleAddTerm(term);
      clearState();
    });
  };

  const handleSetSelectedTerm = React.useCallback(
    (term: TermRef) => setSelectedTerm(term),
    [setSelectedTerm]
  );

  const content = () => (
    <form id='add-term-form' onSubmit={handleSubmit(onSubmit)}>
      <Typography variant='subtitle2' fontSize='0.73rem'>
        Select a term from the dictionary.
      </Typography>
      <Controller
        name='termId'
        control={control}
        rules={{ required: true }}
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

  const actionButton = () => (
    <Button
      text='Add term'
      buttonType='main-lg'
      type='submit'
      form='add-term-form'
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(openBtnEl, { onClick: handleOpen })
      }
      maxWidth='md'
      title={
        <Typography variant='h4' component='span'>
          Add term
        </Typography>
      }
      renderContent={content}
      renderActions={actionButton}
      handleCloseSubmittedForm={isSuccess}
      isLoading={isLoading}
      clearState={clearState}
    />
  );
};

export default AddTermForm;
