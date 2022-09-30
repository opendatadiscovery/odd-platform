import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { DataEntityRef } from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityAddToGroupStatuses,
  getDataEntityClassesList,
} from 'redux/selectors';
import { addDataEntityToGroup } from 'redux/thunks';
import SearchSuggestionsAutocomplete from 'components/shared/Autocomplete/SearchSuggestionsAutocomplete/SearchSuggestionsAutocomplete';

interface AddDataEntityToGroupFormProps {
  btnCreateEl: JSX.Element;
  dataEntityId: number;
}

export interface AddDataEntityToGroupFormData {
  group: DataEntityRef;
}

const AddDataEntityToGroupForm: React.FC<
  AddDataEntityToGroupFormProps
> = ({ btnCreateEl, dataEntityId }) => {
  const dispatch = useAppDispatch();

  const { isLoading: isDataEntityAddingToGroup } = useAppSelector(
    getDataEntityAddToGroupStatuses
  );

  const dataEntityGroupClassId = useAppSelector(
    getDataEntityClassesList
  ).filter(entityClass => entityClass.name === 'DATA_ENTITY_GROUP')[0]?.id;

  const { handleSubmit, control, reset, formState } =
    useForm<AddDataEntityToGroupFormData>({
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: {},
    });

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = React.useCallback(() => {
    setState(initialState);
    reset();
  }, [setState, initialState, reset]);

  const handleFormSubmit = async (data: AddDataEntityToGroupFormData) => {
    dispatch(
      addDataEntityToGroup({
        dataEntityId,
        dataEntityDataEntityGroupFormData: {
          dataEntityGroupId: data.group.id,
        },
      })
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error: response.statusText
            ? 'Unable to add data entity'
            : 'Data entity already added',
        });
      }
    );
  };

  const formTitle = (
    <Typography variant="h4" component="span">
      Add to group
    </Typography>
  );

  const formContent = () => (
    <form
      id="add-entity-to-group-form"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <Controller
        name="group"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <SearchSuggestionsAutocomplete
            formOnChange={field.onChange}
            searchParams={{
              entityClassId: dataEntityGroupClassId,
              manuallyCreated: true,
            }}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="add-entity-to-group-form"
      color="primary"
      fullWidth
      disabled={!formState.isValid}
    >
      Add
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
      isLoading={isDataEntityAddingToGroup}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default AddDataEntityToGroupForm;
