import React from 'react';
import { Grid, Typography } from '@mui/material';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import type {
  DataSetFieldTypeTypeEnum,
  EnumValue,
  EnumValueFormData,
} from 'generated-sources';
import { getDatasetFieldEnumsCreatingStatus } from 'redux/selectors';
import { createDataSetFieldEnum } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { AppButton, DialogWrapper } from 'components/shared';
import { AddIcon } from 'components/shared/Icons';
import DatasetFieldEnumsFormItem from './DatasetFieldEnumsFormItem/DatasetFieldEnumsFormItem';

interface DataSetFieldEnumsFormProps {
  datasetFieldId: number;
  datasetFieldName: string;
  isExternal: boolean;
  btnCreateEl: JSX.Element;
  datasetFieldType: DataSetFieldTypeTypeEnum;
  defaultEnums: EnumValue[];
}

interface DatasetFieldEnumsFormData {
  enums: EnumValueFormData[];
}

const DatasetFieldEnumsForm: React.FC<DataSetFieldEnumsFormProps> = ({
  datasetFieldId,
  datasetFieldName,
  isExternal,
  btnCreateEl,
  datasetFieldType,
  defaultEnums,
}) => {
  const dispatch = useAppDispatch();

  const { isLoading: isEnumsCreating } = useAppSelector(
    getDatasetFieldEnumsCreatingStatus
  );

  const defaultValues = React.useMemo(() => {
    if (defaultEnums[0] && 'id' in defaultEnums[0]) {
      return {
        enums: defaultEnums.map(
          ({ id, name, externalDescription, internalDescription }) => ({
            id,
            name,
            description:
              isExternal && externalDescription
                ? externalDescription
                : internalDescription,
          })
        ),
      };
    }

    return { enums: [{ name: '', description: '' }] };
  }, [defaultEnums, isExternal]);

  const methods = useForm<DatasetFieldEnumsFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'enums',
  });

  const initialFormState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setFormState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialFormState);

  const onOpen = React.useCallback(
    (handleOpen: () => void) => () => {
      if (btnCreateEl.props.onClick) btnCreateEl.props.onClick();
      methods.reset(defaultValues);
      handleOpen();
    },
    [btnCreateEl, defaultValues]
  );

  const clearFormState = React.useCallback(() => {
    setFormState(initialFormState);
    methods.reset();
  }, [initialFormState]);

  const handleFormSubmit = (data: DatasetFieldEnumsFormData) => {
    dispatch(
      createDataSetFieldEnum({
        datasetFieldId,
        bulkEnumValueFormData: {
          items: data.enums.map(enumItem => ({
            id: enumItem.id,
            name: enumItem.name,
            description: enumItem.description,
          })),
        },
      })
    ).then(
      () => {
        setFormState({ ...initialFormState, isSuccessfulSubmit: true });
        clearFormState();
      },
      (response: Response) => {
        setFormState({
          ...initialFormState,
          error: response.statusText || 'Unable to update enums',
        });
      }
    );
  };

  const handleAppend = React.useCallback(() => {
    append({ name: '', description: '' });
  }, [append]);

  const handleRemove = React.useCallback(
    (index: number) => () => {
      remove(index);
    },
    [remove]
  );

  const formTitle = (
    <Grid justifyContent='space-between' alignItems='center' flexWrap='nowrap' container>
      <Grid flexDirection='column' flexWrap='nowrap' width='auto' container>
        <Typography variant='h3'>{`Values for ${datasetFieldName}`}</Typography>
        <Typography variant='body2' color='texts.secondary'>
          Custom values
        </Typography>
      </Grid>
      {!isExternal && (
        <AppButton
          size='medium'
          color='primaryLight'
          startIcon={<AddIcon />}
          onClick={handleAppend}
        >
          Add value
        </AppButton>
      )}
    </Grid>
  );

  const formContent = () => (
    <FormProvider {...methods}>
      <form
        id='dataset-field-enums-form'
        onSubmit={methods.handleSubmit(handleFormSubmit)}
      >
        content
        {/* {fields.map((item, idx) => ( */}
        {/*   <DatasetFieldEnumsFormItem */}
        {/*     key={item.id} */}
        {/*     itemIndex={idx} */}
        {/*     onItemRemove={handleRemove(idx)} */}
        {/*     datasetFieldType={datasetFieldType} */}
        {/*     isKeyEditable={isExternal} */}
        {/*     // isValueEditable={isExternal && ex} */}
        {/*   /> */}
        {/* ))} */}
      </form>
    </FormProvider>
  );

  const formActionButtons = (handleClose: () => void) => (
    <Grid container justifyContent='flex-start'>
      <AppButton
        size='large'
        type='submit'
        form='dataset-field-enums-form'
        color='primary'
        disabled={!methods.formState.isValid}
        isLoading={isEnumsCreating}
        sx={{ mr: 1, minWidth: '64px !important' }}
      >
        Save
      </AppButton>
      <AppButton size='large' color='primaryLight' onClick={handleClose}>
        Cancel
      </AppButton>
    </Grid>
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: onOpen(handleOpen) })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={({ handleClose }) => formActionButtons(handleClose)}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      errorText={error}
      maxWidth='xl'
      clearState={clearFormState}
    />
  );
};

export default DatasetFieldEnumsForm;
