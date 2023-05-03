import React, { type FC } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { Button, DialogWrapper } from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import type { DataEntityLinkListFormData } from 'generated-sources';
import { useAppParams, useSaveDataEntityLinks } from 'lib/hooks';
import LinkItem from './LinkItem/LinkItem';

interface SaveLinksFormProps {
  openBtn: JSX.Element;
}

const SaveLinksForm: FC<SaveLinksFormProps> = ({ openBtn }) => {
  const formId = 'save-links-form';
  const { dataEntityId } = useAppParams();

  const { mutate: saveLinks, isLoading, isSuccess } = useSaveDataEntityLinks();

  const methods = useForm<DataEntityLinkListFormData>({
    defaultValues: { items: [{ name: '', url: '' }] },
    mode: 'onChange',
  });

  const { reset, formState, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'items',
  });

  const clearState = () => reset();

  const handleCreate = async (dataEntityLinkListFormData: DataEntityLinkListFormData) => {
    saveLinks({ dataEntityId, dataEntityLinkListFormData });
  };

  const handleAppend = () => append({ name: '', url: '' });

  const handleRemove = (index: number) => remove(index);

  const formTitle = (
    <Typography variant='h4' component='span'>
      Add links
    </Typography>
  );

  const formContent = () => (
    <FormProvider {...methods}>
      <form id={formId} onSubmit={handleSubmit(handleCreate)}>
        {fields.map((item, idx) => (
          <LinkItem
            key={item.id}
            idx={idx}
            onItemRemove={handleRemove}
            fieldsCount={fields.length}
          />
        ))}
        <Button
          text='Add link'
          buttonType='secondary-m'
          startIcon={<AddIcon />}
          onClick={handleAppend}
        />
      </form>
    </FormProvider>
  );

  const formActionButtons = () => (
    <Button
      text='Save links'
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

export default SaveLinksForm;
