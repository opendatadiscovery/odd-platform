import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { TermDetails, TermFormData } from 'generated-sources';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import {
  Button,
  AppInput,
  DialogWrapper,
  NamespaceAutocomplete,
} from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createTerm, updateTerm } from 'redux/thunks';
import {
  getTermCreatingStatuses,
  getTermDetails,
  getTermUpdatingStatuses,
} from 'redux/selectors';
import { useAppParams, useAppPaths } from 'lib/hooks';

interface TermsFormDialogProps {
  btnCreateEl: JSX.Element;
}

const TermsForm: React.FC<TermsFormDialogProps> = ({ btnCreateEl }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { termId } = useAppParams();
  const { termDetailsOverviewPath } = useAppPaths();

  const term = useAppSelector(getTermDetails(termId));
  const { isLoading: isTermCreating, isLoaded: isTermCreated } = useAppSelector(
    getTermCreatingStatuses
  );
  const { isLoading: isTermUpdating, isLoaded: isTermUpdated } = useAppSelector(
    getTermUpdatingStatuses
  );

  const getDefaultValues = React.useCallback(
    (): TermFormData => ({
      name: term?.name || '',
      namespaceName: term?.namespace?.name || '',
      definition: term?.definition || '',
    }),
    [term]
  );

  const { handleSubmit, control, reset, formState } = useForm<TermFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  React.useEffect(() => {
    reset(getDefaultValues());
  }, [term]);

  const clearState = () => {
    reset();
  };

  const onSubmit = (data: TermFormData) => {
    const parsedData = { ...data };
    (term && term.id
      ? dispatch(updateTerm({ termId: term.id, termFormData: parsedData }))
      : dispatch(createTerm({ termFormData: parsedData }))
    )
      .unwrap()
      .then((response: TermDetails) => {
        clearState();
        navigate(termDetailsOverviewPath(response.id));
      });
  };

  const termFormTitle = (
    <Typography variant='h4' component='span'>
      {term.id ? 'Edit ' : 'Add '}
      term
    </Typography>
  );

  const termFormContent = () => (
    <form id='term-create-form' onSubmit={handleSubmit(onSubmit)}>
      {!term && (
        <Typography variant='subtitle2' fontSize='0.73rem'>
          Select a term from the dictionary or create a new term.
        </Typography>
      )}
      <Controller
        name='name'
        control={control}
        rules={{
          required: true,
          validate: value => !!value.trim(),
        }}
        render={({ field }) => (
          <AppInput
            {...field}
            label='Name'
            placeholder='Start enter the name'
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
        name='namespaceName'
        defaultValue={term?.namespace?.name}
        rules={{ required: true }}
        render={({ field }) => <NamespaceAutocomplete controllerProps={field} />}
      />
      <Controller
        name='definition'
        control={control}
        defaultValue={term?.definition}
        rules={{
          required: true,
          validate: value => !!value.trim(),
        }}
        render={({ field }) => (
          <AppInput
            {...field}
            sx={{ mt: 1.25 }}
            label='Definition'
            placeholder='Term definition'
            multiline
            minRows={4}
            maxRows={6}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
    </form>
  );

  const termFormActionButtons = () => (
    <Button
      text={term ? 'Save term' : 'Add term'}
      buttonType='main-lg'
      type='submit'
      form='term-create-form'
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={termFormTitle}
      renderContent={termFormContent}
      renderActions={termFormActionButtons}
      handleCloseSubmittedForm={term ? isTermUpdated : isTermCreated}
      isLoading={term ? isTermUpdating : isTermCreating}
      clearState={clearState}
      formSubmitHandler={handleSubmit(onSubmit)}
    />
  );
};

export default TermsForm;
