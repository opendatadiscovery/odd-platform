import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  DataEntityClassNameEnum,
  DataEntityDetails,
  DataEntityGroupFormData as GeneratedDataEntityGroupFormData,
  DataEntityType,
  DataEntityTypeNameEnum,
} from 'generated-sources';
import {
  AppButton,
  AppInput,
  AppMenuItem,
  AppSelect,
  DialogWrapper,
  NamespaceAutocomplete,
  SearchSuggestionsAutocomplete,
} from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { useAppParams, useAppPaths } from 'lib/hooks';
import {
  getDataEntityDetails,
  getDataEntityGroupCreatingStatuses,
  getDataEntityGroupUpdatingStatuses,
  getDataEntityTypesByClassName,
} from 'redux/selectors';
import {
  createDataEntityGroup,
  updateDataEntityGroup,
} from 'redux/thunks';
import { useHistory } from 'react-router-dom';
import EntityItem from './EntityItem/EntityItem';
import { EntityItemsContainer } from './DataEntityGroupFormStyles';

interface DataEntityGroupFormProps {
  btnCreateEl: JSX.Element;
}

export interface DataEntityGroupFormData
  extends Omit<GeneratedDataEntityGroupFormData, 'type'> {
  type?: DataEntityType;
}

const DataEntityGroupForm: React.FC<DataEntityGroupFormProps> = ({
  btnCreateEl,
}) => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();
  const history = useHistory();
  const { dataEntityDetailsPath } = useAppPaths();

  const dataEntityGroupDetails: DataEntityDetails = useAppSelector(
    getDataEntityDetails(dataEntityId)
  );

  const types = useAppSelector(state =>
    getDataEntityTypesByClassName(
      state,
      DataEntityClassNameEnum.ENTITY_GROUP
    )
  );

  const { isLoading: isDataEntityGroupCreating } = useAppSelector(
    getDataEntityGroupCreatingStatuses
  );
  const { isLoading: isDataEntityGroupUpdating } = useAppSelector(
    getDataEntityGroupUpdatingStatuses
  );

  const getDefaultValues = React.useCallback(
    (): DataEntityGroupFormData => ({
      name:
        dataEntityGroupDetails?.internalName ||
        dataEntityGroupDetails?.externalName ||
        '',
      namespaceName:
        dataEntityGroupDetails?.dataSource?.namespace?.name || '',
      type: dataEntityGroupDetails?.type,
      entities: dataEntityGroupDetails?.entities || [],
    }),
    [dataEntityGroupDetails]
  );

  const { handleSubmit, control, reset, formState, setValue, register } =
    useForm<DataEntityGroupFormData>({
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: getDefaultValues(),
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entities',
  });

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = React.useCallback(() => {
    setState(initialState);
    reset();
  }, []);

  const handleSubmitForm = (data: DataEntityGroupFormData) => {
    dispatch(
      dataEntityGroupDetails
        ? updateDataEntityGroup({
            dataEntityGroupId: dataEntityGroupDetails.id,
            dataEntityGroupFormData:
              data as GeneratedDataEntityGroupFormData,
          })
        : createDataEntityGroup({
            dataEntityGroupFormData:
              data as GeneratedDataEntityGroupFormData,
          })
    )
      .unwrap()
      .then(
        response => {
          setState({ ...initialState, isSuccessfulSubmit: true });
          clearState();
          history.push(dataEntityDetailsPath(response.id));
        },
        (response: Response) => {
          setState({
            ...initialState,
            error:
              response.statusText || dataEntityGroupDetails
                ? 'Unable to update Data Entity Group'
                : 'Data Entity Group already exists',
          });
        }
      );
  };

  const handleRemove = React.useCallback(
    (index: number) => () => remove(index),
    []
  );

  const formTitle = (
    <Typography variant="h4" component="span">
      {dataEntityGroupDetails ? 'Edit' : 'Add'} Group
    </Typography>
  );

  const formContent = () => (
    <form
      id="dataentitygroup-create-form"
      onSubmit={handleSubmit(handleSubmitForm)}
    >
      <Controller
        name="name"
        control={control}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            placeholder="Data Entity Group Name"
            label="Name"
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
      <Controller
        control={control}
        name="namespaceName"
        render={({ field }) => (
          <NamespaceAutocomplete controllerProps={field} />
        )}
      />
      <Controller
        name="type"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AppSelect
            label="Type"
            sx={{ mt: 1.5 }}
            defaultValue={field.value?.name}
          >
            {types
              ?.filter(
                // filtration needs to avoid user create ml_experiment from ui
                type => type.name !== DataEntityTypeNameEnum.ML_EXPERIMENT
              )
              .map(type => (
                <AppMenuItem
                  {...field}
                  key={type.id}
                  value={type.name}
                  onClick={() => setValue('type', type)}
                >
                  {type.name}
                </AppMenuItem>
              ))}
          </AppSelect>
        )}
      />
      <SearchSuggestionsAutocomplete
        formOnChange={register('entities').onChange}
        append={append}
        addEntities
      />
      <EntityItemsContainer sx={{ mt: 1.25 }}>
        {fields?.map((entity, index) => (
          <EntityItem
            key={entity.id}
            entity={entity}
            onRemoveClick={handleRemove(index)}
          />
        ))}
      </EntityItemsContainer>
    </form>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="dataentitygroup-create-form"
      color="primary"
      fullWidth
      disabled={!formState.isValid}
    >
      {dataEntityGroupDetails ? 'Save changes' : 'Create group'}
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth="xs"
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, {
          onClick: () => {
            clearState();
            handleOpen();
          },
        })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={
        dataEntityGroupDetails
          ? isDataEntityGroupUpdating
          : isDataEntityGroupCreating
      }
      errorText={error}
      clearState={clearState}
    />
  );
};

export default DataEntityGroupForm;
