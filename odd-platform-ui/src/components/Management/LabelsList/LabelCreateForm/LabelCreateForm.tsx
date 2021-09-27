import React from 'react';
import { Typography } from '@mui/material';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import {
  LabelFormData,
  Label,
  LabelApiCreateLabelRequest,
} from 'generated-sources';
import AddIcon from 'components/shared/Icons/AddIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import LabelCreateFormItem from './LabelCreateFormItem/LabelCreateFormItem';
import { StylesType } from './LabelCreateFormStyles';

interface LabelCreateFormProps extends StylesType {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
  createLabel: (params: LabelApiCreateLabelRequest) => Promise<Label[]>;
}

interface LabelCreateFormData {
  labels: LabelFormData[];
}

const LabelCreateForm: React.FC<LabelCreateFormProps> = ({
  classes,
  btnCreateEl,
  isLoading,
  createLabel,
}) => {
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
    createLabel({ labelFormData: data.labels }).then(
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

  const formTitle = <Typography variant="h4">Create Label</Typography>;

  const formContent = () => (
    <>
      <FormProvider {...methods}>
        <form id="label-create-form" className={classes.container}>
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
            icon={<AddIcon />}
            onClick={handleAppend}
          >
            Create label
          </AppButton>
        </form>
      </FormProvider>
    </>
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
      isLoading={isLoading}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default LabelCreateForm;
