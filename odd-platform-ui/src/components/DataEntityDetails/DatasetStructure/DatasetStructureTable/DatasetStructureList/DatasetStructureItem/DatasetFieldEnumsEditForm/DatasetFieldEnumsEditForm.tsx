import React from 'react';
import { Grid, Typography } from '@mui/material';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import {
  DataSetFieldTypeTypeEnum,
  EnumValueFormData,
} from 'generated-sources';
import {
  getDatasetFieldEnums,
  getDatasetFieldEnumsCreatingStatus,
  getDatasetFieldEnumsFetchingStatus,
} from 'redux/selectors';
import {
  createDataSetFieldEnum,
  fetchDataSetFieldEnum,
} from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import AddIcon from 'components/shared/Icons/AddIcon';
import DatasetFieldEnumsFormItem from 'components/DataEntityDetails/DatasetStructure/DatasetStructureTable/DatasetStructureList/DatasetStructureItem/DatasetFieldEnumsEditForm/DatasetFieldEnumsFormItem/DatasetFieldEnumsFormItem';
import AppCircularProgress from 'components/shared/AppCircularProgress/AppCircularProgress';
import {
  ActionsContainer,
  HeaderContainer,
  TitleContainer,
} from './DatasetFieldEnumsEditFormStyles';

interface DataSetFieldEnumEditFormProps {
  datasetFieldId: number;
  datasetFieldName: string;
  btnCreateEl: JSX.Element;
  enumValueType: DataSetFieldTypeTypeEnum;
}

interface DatasetFieldEnumsFormData {
  enums: EnumValueFormData[];
}

const DatasetFieldEnumsEditForm: React.FC<
  DataSetFieldEnumEditFormProps
> = ({ datasetFieldId, datasetFieldName, btnCreateEl, enumValueType }) => {
  const dispatch = useAppDispatch();

  const { isLoading: isEnumsCreating } = useAppSelector(
    getDatasetFieldEnumsCreatingStatus
  );
  const { isLoading: isEnumsFetching } = useAppSelector(
    getDatasetFieldEnumsFetchingStatus
  );
  const datasetFieldEnums = useAppSelector(
    getDatasetFieldEnums(datasetFieldId)
  );

  const defaultEnums = React.useMemo(() => {
    if (datasetFieldEnums[0] && 'id' in datasetFieldEnums[0]) {
      return {
        enums: datasetFieldEnums.map(enumItem => ({
          id: enumItem.id,
          name: enumItem.name,
          description: enumItem.description,
        })),
      };
    }

    return { enums: [{ name: '', description: '' }] };
  }, [datasetFieldEnums]);

  const methods = useForm<DatasetFieldEnumsFormData>({
    defaultValues: defaultEnums,
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

  React.useEffect(() => {
    methods.reset(defaultEnums);
  }, [defaultEnums]);

  const onOpen = (handleOpen: () => void) => () => {
    if (btnCreateEl.props.onClick) btnCreateEl.props.onClick();
    dispatch(fetchDataSetFieldEnum({ datasetFieldId }));
    handleOpen();
  };

  const clearFormState = () => {
    setFormState(initialFormState);
    methods.reset();
  };

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

  const handleAppend = () => {
    append({
      name: '',
      description: '',
    });
  };

  const handleRemove = React.useCallback(
    (index: number) => () => {
      remove(index);
    },
    [remove]
  );

  const formTitle = (
    <HeaderContainer container>
      <TitleContainer container>
        <Typography variant="h3">
          {`Values for ${datasetFieldName}`}
        </Typography>
        <Typography variant="body2" color="texts.secondary">
          Custom values
        </Typography>
      </TitleContainer>
      <AppButton
        size="medium"
        color="primaryLight"
        startIcon={<AddIcon />}
        onClick={handleAppend}
      >
        Add value
      </AppButton>
    </HeaderContainer>
  );

  const formContent = () => (
    <>
      {isEnumsFetching ? (
        <Grid container justifyContent="center">
          <AppCircularProgress
            background="transparent"
            progressBackground="dark"
            size={30}
          />
        </Grid>
      ) : (
        <FormProvider {...methods}>
          <form
            id="dataset-field-enums-form"
            onSubmit={methods.handleSubmit(handleFormSubmit)}
          >
            {fields.map((item, idx) => (
              <DatasetFieldEnumsFormItem
                key={item.id}
                itemId={item.id}
                itemIndex={idx}
                onItemRemove={handleRemove(idx)}
                enumValueType={enumValueType}
              />
            ))}
          </form>
        </FormProvider>
      )}
    </>
  );

  const formActionButtons = (handleClose: () => void) => (
    <ActionsContainer>
      <AppButton
        size="large"
        type="submit"
        form="dataset-field-enums-form"
        color="primary"
        disabled={!methods.formState.isValid}
        sx={{ mr: 1 }}
      >
        Save
      </AppButton>
      <AppButton size="large" color="primaryLight" onClick={handleClose}>
        Cancel
      </AppButton>
    </ActionsContainer>
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
      isLoading={isEnumsCreating}
      errorText={error}
      maxWidth="xl"
      clearState={clearFormState}
    />
  );
};

export default DatasetFieldEnumsEditForm;
