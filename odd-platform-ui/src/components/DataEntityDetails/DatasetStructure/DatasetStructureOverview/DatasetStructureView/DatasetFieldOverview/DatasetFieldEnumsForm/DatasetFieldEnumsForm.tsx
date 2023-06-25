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
import { Button, DialogWrapper } from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import DatasetFieldEnumsFormItem from './DatasetFieldEnumsFormItem/DatasetFieldEnumsFormItem';

interface DataSetFieldEnumsFormProps {
  datasetFieldId: number;
  datasetFieldName: string;
  isExternal: boolean;
  btnCreateEl: JSX.Element;
  datasetFieldType: DataSetFieldTypeTypeEnum;
  defaultEnums: EnumValue[] | undefined;
}

interface DatasetFieldEnumsFormData {
  enums: Array<EnumValueFormData & { modifiable?: boolean }>;
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

  const { isLoading: isEnumsCreating, isLoaded: isEnumsCreated } = useAppSelector(
    getDatasetFieldEnumsCreatingStatus
  );

  const defaultValues = React.useMemo<DatasetFieldEnumsFormData>(() => {
    if (defaultEnums) {
      if (defaultEnums[0] && 'id' in defaultEnums[0]) {
        const enums = defaultEnums.map(({ id, name, description, modifiable }) => ({
          id,
          name,
          description,
          modifiable,
        }));

        return { enums };
      }
    }

    return { enums: [{ name: '', description: '', modifiable: true }] };
  }, [defaultEnums]);

  const isFormEditable = React.useMemo(
    () => defaultValues.enums.some(el => el?.modifiable),
    [defaultValues]
  );

  const methods = useForm<DatasetFieldEnumsFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'enums',
  });

  const onOpen = React.useCallback(
    (handleOpen: () => void) => () => {
      if (btnCreateEl.props.onClick) btnCreateEl.props.onClick();
      methods.reset(defaultValues);
      handleOpen();
    },
    [btnCreateEl, defaultValues]
  );

  const clearFormState = React.useCallback(() => {
    methods.reset();
  }, []);

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
    ).then(() => {
      clearFormState();
    });
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
        <Button
          text='Add value'
          buttonType='secondary-m'
          startIcon={<AddIcon />}
          onClick={handleAppend}
        />
      )}
    </Grid>
  );

  const formContent = () => (
    <FormProvider {...methods}>
      <form
        id='dataset-field-enums-form'
        onSubmit={methods.handleSubmit(handleFormSubmit)}
      >
        {fields.map((item, idx) => (
          <DatasetFieldEnumsFormItem
            key={item.id}
            itemIndex={idx}
            onItemRemove={handleRemove(idx)}
            datasetFieldType={datasetFieldType}
            isKeyEditable={isExternal}
            isValueEditable={item.modifiable}
          />
        ))}
      </form>
    </FormProvider>
  );

  const formActionButtons = (handleClose: () => void) => (
    <Grid container justifyContent='flex-start'>
      <Button
        text='Save'
        buttonType='main-lg'
        type='submit'
        form='dataset-field-enums-form'
        disabled={!methods.formState.isValid || !isFormEditable}
        isLoading={isEnumsCreating}
        sx={{ mr: 1, minWidth: '64px !important' }}
      />
      <Button text='Cancel' buttonType='secondary-lg' onClick={handleClose} />
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
      handleCloseSubmittedForm={isEnumsCreated}
      maxWidth='xl'
      clearState={clearFormState}
    />
  );
};

export default DatasetFieldEnumsForm;
