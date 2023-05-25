import React, { type FC } from 'react';
import { useAppParams, useUpdateDataEntityLink } from 'lib/hooks';
import { Controller, useForm } from 'react-hook-form';
import type { DataEntityLink, DataEntityLinkFormData } from 'generated-sources';
import { Typography } from '@mui/material';
import { AppInput, Button, DialogWrapper } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';

interface EditLinkFormProps {
  openBtn: JSX.Element;
  linkId: DataEntityLink['id'];
  name: DataEntityLink['name'];
  url: DataEntityLink['url'];
}

const EditLinkForm: FC<EditLinkFormProps> = ({ openBtn, linkId, name, url }) => {
  const formId = 'update-link-form';
  const { dataEntityId } = useAppParams();

  const { mutate: updateLink, isLoading, isSuccess } = useUpdateDataEntityLink();

  const { reset, formState, handleSubmit, control } = useForm<DataEntityLinkFormData>({
    defaultValues: { name, url },
    mode: 'onChange',
  });

  const clearState = () => reset();

  const handleUpdate = async (dataEntityLinkFormData: DataEntityLinkFormData) => {
    updateLink({ dataEntityId, linkId, dataEntityLinkFormData });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Edit link
    </Typography>
  );

  const formContent = () => (
    <form id={formId} onSubmit={handleSubmit(handleUpdate)}>
      <Controller
        name='url'
        control={control}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            placeholder='Place link here'
            label='URL'
            required
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
        name='name'
        control={control}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            sx={{ mt: 1, mb: 2 }}
            placeholder='Enter custom name'
            label='Custom name'
            required
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

  const formActionButtons = () => (
    <Button
      text='Save changes'
      buttonType='main-lg'
      type='submit'
      form={formId}
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      maxWidth='md'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(openBtn, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccess}
      isLoading={isLoading}
      clearState={clearState}
    />
  );
};

export default EditLinkForm;
