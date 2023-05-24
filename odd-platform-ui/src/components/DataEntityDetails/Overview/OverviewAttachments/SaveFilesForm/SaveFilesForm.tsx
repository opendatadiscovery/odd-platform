import React, { type FC, useCallback, useState } from 'react';
import { useAppParams, useSaveDataEntityFile } from 'lib/hooks';
import { Controller, useForm } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import { Button, DialogWrapper, FileInput } from 'components/shared/elements';
import FileItem from './FileItem/FileItem';

interface SaveFilesFormProps {
  openBtn: JSX.Element;
  maxSize?: number;
}

interface FormData {
  file: Blob;
}

const SaveFilesForm: FC<SaveFilesFormProps> = ({ openBtn, maxSize }) => {
  const formId = 'save-files-form';
  const { dataEntityId } = useAppParams();

  const { mutate: saveFile, isLoading, isSuccess } = useSaveDataEntityFile();

  const [uploadedFile, setUploadedFile] = useState<Blob | undefined>(undefined);
  const { reset, handleSubmit, control } = useForm<FormData>({
    defaultValues: { file: undefined },
    mode: 'onChange',
  });

  const clearState = () => {
    setUploadedFile(undefined);
    reset();
  };

  const onSubmit = () => {
    if (!uploadedFile) return;

    saveFile({ dataEntityId, file: uploadedFile });
  };

  const handleFileDelete = useCallback(() => {
    setUploadedFile(undefined);
  }, []);

  const formTitle = (
    <Typography variant='h4' component='span'>
      Add file
    </Typography>
  );

  const handleFilesUpload = useCallback(
    (onChange: (val: unknown) => void) => (files: File[] | null | undefined) => {
      if (files) {
        const file = files[0];
        setUploadedFile(file);
        onChange(file);
      }
    },
    []
  );

  const formContent = () => (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='file'
        control={control}
        render={({ field: { onChange } }) => (
          <FileInput
            multiple
            onFilesSelected={handleFilesUpload(onChange)}
            maxFileSizeInBytes={maxSize}
          />
        )}
      />
      <Grid container flexDirection='column' mt={2}>
        {uploadedFile && (
          <FileItem
            key={`${uploadedFile.name}-${uploadedFile.size}`}
            name={uploadedFile.name}
            size={uploadedFile.size}
            type={uploadedFile.type}
            handleDelete={handleFileDelete}
          />
        )}
      </Grid>
    </form>
  );

  const formActionButtons = () => (
    <Button
      text='Save files'
      buttonType='main-lg'
      type='submit'
      form={formId}
      fullWidth
      disabled={!uploadedFile || isLoading}
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

export default SaveFilesForm;
