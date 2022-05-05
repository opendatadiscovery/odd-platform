import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import {
  DataEntityApiCreateDataEntityGroupRequest,
  DataEntityApiUpdateDataEntityGroupRequest,
  DataEntityClassNameEnum,
  DataEntityGroupDetails,
  DataEntityGroupFormData,
  DataEntityType,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { useAppDispatch, useAppParams, useAppSelector } from 'lib/hooks';
import {
  getDataEntityTypesByClassName,
  getDataEntityDetails,
} from 'redux/selectors/dataentity.selectors';
import {
  createDataEntityGroup,
  updateDataEntityGroup,
} from 'redux/thunks';
import EntitiesSuggestionsAutocompleteContainer from './EntitiesSuggestionsAutoocomplete/EntitiesSuggestionsAutocompleteContainer';
import NamespaceAutocompleteContainer from './NamespaceAutocomplete/NamespaceAutocompleteContainer';

interface DataEntityGroupFormProps {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
}

const DataEntityGroupForm: React.FC<DataEntityGroupFormProps> = ({
  btnCreateEl,
  isLoading,
}) => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const dataEntityGroupDetails = useAppSelector(state =>
    getDataEntityDetails(state, dataEntityId)
  );

  const types = useAppSelector(state =>
    getDataEntityTypesByClassName(
      state,
      DataEntityClassNameEnum.ENTITY_GROUP
    )
  );

  const { handleSubmit, control, reset, formState } =
    useForm<DataEntityGroupFormData>({
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: {
        name:
          dataEntityGroupDetails?.internalName ||
          dataEntityGroupDetails?.externalName ||
          '',
        namespaceName:
          `${dataEntityGroupDetails?.dataSource?.namespace}` || '',
        type: dataEntityGroupDetails?.type,
        entities: dataEntityGroupDetails?.entities,
      },
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

  const handleSubmitForm = async (data: DataEntityGroupFormData) => {
    (dataEntityGroupDetails
      ? dispatch(
          updateDataEntityGroup({
            dataEntityGroupId: dataEntityGroupDetails.id,
            dataEntityGroupFormData: data,
          })
        )
      : dispatch(createDataEntityGroup({ dataEntityGroupFormData: data }))
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
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

  const formTitle = (
    <Typography variant="h4" component="span">
      {dataEntityGroupDetails ? 'Edit' : 'Add'} Group
    </Typography>
  );

  const formContent = () => (
    <form
      id="dataEntityGroupDetails-create-form"
      onSubmit={handleSubmit(handleSubmitForm)}
    >
      <Controller
        name="name"
        control={control}
        defaultValue={
          dataEntityGroupDetails?.externalName ||
          dataEntityGroupDetails?.internalName ||
          ''
        }
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppTextField
            {...field}
            placeholder="Data Entity Group Name"
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
        defaultValue={dataEntityGroupDetails?.dataSource?.namespace?.name}
        render={({ field }) => (
          <NamespaceAutocompleteContainer controllerProps={field} />
        )}
      />
      <Controller
        name="type"
        control={control}
        defaultValue={dataEntityGroupDetails?.type}
        rules={{ required: true }}
        render={({ field }) => (
          <AppTextField {...field} label="Type" select>
            {types.map(type => (
              <AppMenuItem key={type.id} value={type.name}>
                {type.name}
              </AppMenuItem>
            ))}
          </AppTextField>
        )}
      />
      <Grid container>
        <Controller
          name="entities"
          control={control}
          defaultValue={dataEntityGroupDetails?.entities}
          // rules={{ required: true }}
          render={({ field }) => (
            <EntitiesSuggestionsAutocompleteContainer
              controllerProps={field}
            />
          )}
        />
        <AppButton sx={{ mt: 2 }} size="medium" color="primaryLight">
          Add
        </AppButton>
      </Grid>
    </form>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="owner-create-form"
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
      isLoading={isLoading}
      errorText={error}
      clearState={clearState}
    />
  );
  return null;
};

export default DataEntityGroupForm;
