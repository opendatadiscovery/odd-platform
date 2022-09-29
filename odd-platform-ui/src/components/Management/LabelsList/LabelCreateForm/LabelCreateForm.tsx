import React from 'react';
import { Typography } from '@mui/material';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { LabelFormData } from 'generated-sources';
import { getLabelCreatingStatuses } from 'redux/selectors';
import { createLabel } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import AddIcon from 'components/shared/Icons/AddIcon';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import LabelCreateFormItem from './LabelCreateFormItem/LabelCreateFormItem';

interface LabelCreateFormProps {
  btnCreateEl: JSX.Element;
}

interface LabelCreateFormData {
  labels: LabelFormData[];
}

const LabelCreateForm: React.FC<LabelCreateFormProps> = ({
  btnCreateEl,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading: isLabelCreating } = useAppSelector(
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

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = () => {
    setState(initialState);
    methods.reset();
  };

  const handleCreate = async (data: LabelCreateFormData) => {
    dispatch(createLabel({ labelFormData: data.labels })).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error: response.statusText || 'Label already exists',
        });
      }
    );
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
    <Typography variant="h4" component="span">
      Create Label
    </Typography>
  );

  const formContent = () => (
    <FormProvider {...methods}>
      <form id="label-create-form">
        {fields.map((item, index) => (
          <LabelCreateFormItem
            key={item.id}
            itemIndex={index}
            fieldsLength={fields.length}
            onItemRemove={handleRemove(index)}
          />
        ))}
        <AppButton
          size="medium"
          form="tag-create-form"
          color="primaryLight"
          startIcon={<AddIcon />}
          onClick={handleAppend}
        >
          Create label
        </AppButton>
      </form>
    </FormProvider>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="label-create-form"
      color="primary"
      fullWidth
      disabled={!methods.formState.isValid}
      onClick={methods.handleSubmit(handleCreate)}
    >
      Create
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth="xs"
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isLabelCreating}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default LabelCreateForm;
