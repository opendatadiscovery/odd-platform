import React, { cloneElement, type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Button from 'components/shared/elements/Button/Button';
import TermsAutocomplete from 'components/shared/elements/Autocomplete/TermsAutocomplete/TermsAutocomplete';
import type { TermRef } from 'generated-sources';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';
import Markdown from 'components/shared/elements/Markdown/Markdown';

interface AssignTermFormData {
  termId: number;
}

interface AssignTermFormProps {
  onSubmit: (clearState: () => void) => ({ termId }: AssignTermFormData) => void;
  openBtnEl: JSX.Element;
  handleCloseSubmittedForm: boolean;
  isLoading: boolean;
}

const AssignTermForm: FC<AssignTermFormProps> = ({
  onSubmit,
  openBtnEl,
  handleCloseSubmittedForm,
  isLoading,
}) => {
  const { t } = useTranslation();
  const formId = 'assign-term-form';

  const { handleSubmit, control, reset, formState } = useForm<AssignTermFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [selectedTerm, setSelectedTerm] = React.useState<TermRef | null>(null);

  const clearState = () => {
    setSelectedTerm(null);
    reset();
  };

  const handleSetSelectedTerm = React.useCallback(
    (term: TermRef) => setSelectedTerm(term),
    []
  );

  const formTitle = (
    <Typography variant='h4' component='span'>
      {t('Add term')}
    </Typography>
  );

  const formContent = () => (
    <form id={formId} onSubmit={handleSubmit(onSubmit(clearState))}>
      <Typography variant='subtitle2' fontSize='0.73rem'>
        {t('Select a term from the dictionary')}.
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
              {t('Namespace')}:
            </Typography>
            {selectedTerm.namespace.name}
          </Grid>
          <Grid container flexDirection='column' sx={{ mt: 2 }}>
            <Typography variant='body2' color='texts.secondary' component='span'>
              {t('Definition')}:
            </Typography>
            <Markdown value={selectedTerm.definition} />
          </Grid>
        </>
      )}
    </form>
  );

  const formActionButtons = () => (
    <Button
      text={t('Add term')}
      buttonType='main-lg'
      type='submit'
      form={formId}
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) => cloneElement(openBtnEl, { onClick: handleOpen })}
      maxWidth='md'
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={handleCloseSubmittedForm}
      isLoading={isLoading}
      clearState={clearState}
    />
  );
};

export default AssignTermForm;
