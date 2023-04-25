import React from 'react';
import { Typography } from '@mui/material';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import type { LabelFormData } from 'generated-sources';
import { getLabelCreatingStatuses } from 'redux/selectors';
import { createLabel } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { AddIcon } from 'components/shared/icons';
import { DialogWrapper, Button } from 'components/shared/elements';
import LabelCreateFormItem from './LabelCreateFormItem/LabelCreateFormItem';

interface LabelCreateFormProps {
  btnCreateEl: JSX.Element;
}

interface LabelCreateFormData {
  labels: LabelFormData[];
}

const LabelCreateForm: React.FC<LabelCreateFormProps> = ({ btnCreateEl }) => {
  const dispatch = useAppDispatch();
  const { isLoading: isLabelCreating, isLoaded: isLabelCreated } = useAppSelector(
    getLabelCreatingStatuses
  );
  const methods = useForm<LabelCreateFormData>({
    defaultValues: {
      labels: [
        {
          name: '',
        },
      ],
    },
    mode: 'onChange',
  });
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'labels',
  });

  const clearState = () => {
    methods.reset();
  };

  const handleCreate = async (data: LabelCreateFormData) => {
    dispatch(createLabel({ labelFormData: data.labels })).then(() => {
      clearState();
    });
  };

  const handleAppend = React.useCallback(() => {
    append({
      name: '',
    });
  }, [append]);

  const handleRemove = (index: number) => () => {
    remove(index);
    if (!fields.length) handleAppend();
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Create Label
    </Typography>
  );

  const formContent = () => (
    <FormProvider {...methods}>
      <form id='label-create-form'>
        {fields.map((item, index) => (
          <LabelCreateFormItem
            key={item.id}
            itemIndex={index}
            fieldsLength={fields.length}
            onItemRemove={handleRemove(index)}
          />
        ))}
        <Button
          text='Add'
          buttonType='secondary-m'
          startIcon={<AddIcon />}
          onClick={handleAppend}
        />
      </form>
    </FormProvider>
  );

  const formActionButtons = () => (
    <Button
      text='Create'
      type='submit'
      form='label-create-form'
      buttonType='main-lg'
      fullWidth
      disabled={!methods.formState.isValid}
      onClick={methods.handleSubmit(handleCreate)}
    />
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isLabelCreated}
      isLoading={isLabelCreating}
      clearState={clearState}
    />
  );
};

export default LabelCreateForm;
