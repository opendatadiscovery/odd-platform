import React, { cloneElement } from 'react';
import { useAssignEntityQueryExample } from 'lib/hooks/api/dataModelling/queryExamples';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import QueryExamplesAutocomplete from 'components/shared/elements/QueryExamples/QueryExamplesAutocomplete';
import Button from 'components/shared/elements/Button/Button';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';

interface AssignEntityQueryFormProps {
  openBtnEl: JSX.Element;
  dataEntityId: number;
}

type FormData = {
  exampleId: number;
};

const AssignEntityQueryExampleForm: React.FC<AssignEntityQueryFormProps> = ({
  openBtnEl,
  dataEntityId,
}) => {
  const { t } = useTranslation();
  const { mutateAsync, isSuccess } = useAssignEntityQueryExample();
  const formId = 'assign-query-example-form';

  const { handleSubmit, control, reset, formState } = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const clear = () => {
    reset();
  };

  const onSubmit = ({ exampleId }: FormData) => {
    mutateAsync({
      dataEntityId,
      dataEntityQueryExampleFormData: { queryExampleId: exampleId },
    }).then(_ => {
      reset();
    });
  };

  const title = (
    <Typography variant='h4' component='span'>
      {t('Add query example')}
    </Typography>
  );

  const formContent = () => (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Typography variant='subtitle2' fontSize='0.73rem'>
        {t('Select a query example from the list')}.
      </Typography>
      <Controller
        name='exampleId'
        control={control}
        rules={{ required: true }}
        render={({ field }) => <QueryExamplesAutocomplete field={field} />}
      />
    </form>
  );

  const actionButton = () => (
    <Button
      text={t('Add query example')}
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
      title={title}
      renderContent={formContent}
      renderActions={actionButton}
      handleCloseSubmittedForm={isSuccess}
      clearState={clear}
    />
  );
};

export default AssignEntityQueryExampleForm;
