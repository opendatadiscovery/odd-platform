import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  DataEntityClassNameEnum,
  type DataEntityDetails,
  type DataEntityGroupFormData,
  type DataEntityType,
  DataEntityTypeNameEnum,
} from 'generated-sources';
import {
  AppMenuItem,
  AppSelect,
  Button,
  DialogWrapper,
  Input,
  NamespaceAutocomplete,
  SearchSuggestionsAutocomplete,
} from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams, useAppPaths } from 'lib/hooks';
import {
  getDataEntityDetails,
  getDataEntityGroupCreatingStatuses,
  getDataEntityGroupUpdatingStatuses,
  getDataEntityTypesByClassName,
} from 'redux/selectors';
import { createDataEntityGroup, updateDataEntityGroup } from 'redux/thunks';
import { useNavigate } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import EntityItem from './EntityItem/EntityItem';
import { EntityItemsContainer } from './DataEntityGroupFormStyles';

interface DataEntityGroupFormProps {
  btnCreateEl: JSX.Element;
}

const DataEntityGroupForm: React.FC<DataEntityGroupFormProps> = ({ btnCreateEl }) => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();
  const navigate = useNavigate();
  const { dataEntityOverviewPath } = useAppPaths();

  const dataEntityGroupDetails: DataEntityDetails = useAppSelector(
    getDataEntityDetails(dataEntityId)
  );

  const types = useAppSelector(
    getDataEntityTypesByClassName(DataEntityClassNameEnum.ENTITY_GROUP)
  );

  const { isLoading: isDataEntityGroupCreating, isLoaded: isDataEntityGroupCreated } =
    useAppSelector(getDataEntityGroupCreatingStatuses);
  const { isLoading: isDataEntityGroupUpdating, isLoaded: isDataEntityGroupUpdated } =
    useAppSelector(getDataEntityGroupUpdatingStatuses);

  const defaultValues = React.useMemo(
    (): DataEntityGroupFormData => ({
      name:
        dataEntityGroupDetails?.internalName ||
        dataEntityGroupDetails?.externalName ||
        '',
      namespaceName: dataEntityGroupDetails?.dataSource?.namespace?.name || '',
      type: dataEntityGroupDetails?.type || ({} as DataEntityType),
      entities: dataEntityGroupDetails?.entities || [],
    }),
    [dataEntityGroupDetails]
  );

  const { handleSubmit, control, reset, formState } = useForm<DataEntityGroupFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entities',
    rules: { required: true },
  });

  const clearState = React.useCallback(() => {
    reset();
  }, []);

  const handleSubmitForm = (data: DataEntityGroupFormData) => {
    dispatch(
      dataEntityGroupDetails.id
        ? updateDataEntityGroup({
            dataEntityGroupId: dataEntityGroupDetails.id,
            dataEntityGroupFormData: data,
          })
        : createDataEntityGroup({ dataEntityGroupFormData: data })
    )
      .unwrap()
      .then(response => {
        clearState();
        navigate(dataEntityOverviewPath(response.id));
      });
  };

  const handleRemove = React.useCallback((index: number) => () => remove(index), []);

  const formTitle = (
    <Typography variant='h4' component='span'>
      {dataEntityGroupDetails.id ? 'Edit' : 'Add'} Group
    </Typography>
  );

  const formContent = () => (
    <form id='dataentitygroup-create-form' onSubmit={handleSubmit(handleSubmitForm)}>
      <Controller
        name='name'
        control={control}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            placeholder='Data Entity Group Name'
            label='Name'
          />
        )}
      />
      <Controller
        control={control}
        name='namespaceName'
        render={({ field }) => <NamespaceAutocomplete controllerProps={field} />}
      />
      <Controller
        name='type'
        control={control}
        rules={{ required: true, validate: val => !isEmpty(val) }}
        render={({ field }) => (
          <AppSelect
            {...field}
            label='Type'
            sx={{ mt: 1.5 }}
            renderValue={value => (value as DataEntityType).name}
          >
            {types
              ?.filter(
                // filtration needs to avoid user create ml_experiment from ui
                type => type.name !== DataEntityTypeNameEnum.ML_EXPERIMENT
              )
              .map(type => (
                <AppMenuItem key={type.id} value={type as never}>
                  {type.name}
                </AppMenuItem>
              ))}
          </AppSelect>
        )}
      />
      <SearchSuggestionsAutocomplete
        append={append}
        addEntities
        inputParams={{ label: 'Entities', variant: 'main-m' }}
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
    <Button
      text={dataEntityGroupDetails.id ? 'Save changes' : 'Create group'}
      buttonType='main-lg'
      type='submit'
      form='dataentitygroup-create-form'
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      maxWidth='xs'
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
      handleCloseSubmittedForm={isDataEntityGroupUpdated || isDataEntityGroupCreated}
      isLoading={
        dataEntityGroupDetails ? isDataEntityGroupUpdating : isDataEntityGroupCreating
      }
      clearState={clearState}
    />
  );
};

export default DataEntityGroupForm;
