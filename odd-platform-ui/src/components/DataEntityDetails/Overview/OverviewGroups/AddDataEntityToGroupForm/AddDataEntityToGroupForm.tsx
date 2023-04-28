import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { type DataEntityRef } from 'generated-sources';
import {
  DialogWrapper,
  Button,
  SearchSuggestionsAutocomplete,
} from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityAddToGroupStatuses,
  getDataEntityClassesList,
} from 'redux/selectors';
import { addDataEntityToGroup } from 'redux/thunks';

interface AddDataEntityToGroupFormProps {
  btnCreateEl: JSX.Element;
  dataEntityId: number;
}

export interface AddDataEntityToGroupFormData {
  group: DataEntityRef;
}

const AddDataEntityToGroupForm: React.FC<AddDataEntityToGroupFormProps> = ({
  btnCreateEl,
  dataEntityId,
}) => {
  const dispatch = useAppDispatch();

  const { isLoading: isDataEntityAddingToGroup, isLoaded: isDataEntityAddedToGroup } =
    useAppSelector(getDataEntityAddToGroupStatuses);

  const dataEntityGroupClassId = useAppSelector(getDataEntityClassesList).filter(
    entityClass => entityClass.name === 'DATA_ENTITY_GROUP'
  )[0]?.id;

  const { handleSubmit, control, reset, formState } =
    useForm<AddDataEntityToGroupFormData>({
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: {},
    });

  const clearState = React.useCallback(() => {
    reset();
  }, []);

  const handleFormSubmit = async (data: AddDataEntityToGroupFormData) => {
    dispatch(
      addDataEntityToGroup({
        dataEntityId,
        dataEntityDataEntityGroupFormData: {
          dataEntityGroupId: data.group.id,
        },
      })
    ).then(() => {
      clearState();
    });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Add to group
    </Typography>
  );

  const formContent = () => (
    <form id='add-entity-to-group-form' onSubmit={handleSubmit(handleFormSubmit)}>
      <Controller
        name='group'
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
    <Button
      text='Add'
      buttonType='main-lg'
      type='submit'
      form='add-entity-to-group-form'
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
      handleCloseSubmittedForm={isDataEntityAddedToGroup}
      isLoading={isDataEntityAddingToGroup}
      clearState={clearState}
    />
  );
};

export default AddDataEntityToGroupForm;
