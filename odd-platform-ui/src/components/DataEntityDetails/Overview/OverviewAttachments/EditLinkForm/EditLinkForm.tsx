import React, { type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppParams, useUpdateDataEntityLink } from 'lib/hooks';
import type { DataEntityLink, DataEntityLinkFormData } from 'generated-sources';
import { Button, DialogWrapper, Input } from 'components/shared/elements';

interface EditLinkFormProps {
  openBtn: JSX.Element;
  linkId: DataEntityLink['id'];
  name: DataEntityLink['name'];
  url: DataEntityLink['url'];
}

const EditLinkForm: FC<EditLinkFormProps> = ({ openBtn, linkId, name, url }) => {
  const formId = 'update-link-form';
  const { t } = useTranslation();
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
          <Input
            {...field}
            variant='main-m'
            placeholder={t('Place link here')}
            label={t('URL')}
          />
        )}
      />
      <Controller
        name='name'
        control={control}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            sx={{ mt: 1, mb: 2 }}
            placeholder={t('Enter custom name')}
            label={t('Custom name')}
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
