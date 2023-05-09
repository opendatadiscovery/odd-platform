import React, { type FC, useCallback, useState } from 'react';
import { useAppParams, useSaveDataEntityFiles } from 'lib/hooks';
import { Controller, useForm } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import { Button, DialogWrapper, FileInput } from 'components/shared/elements';
import FileItem from './FileItem/FileItem';

interface SaveFilesFormProps {
  openBtn: JSX.Element;
}

interface FormData {
  files: Array<Blob>;
}

const SaveFilesForm: FC<SaveFilesFormProps> = ({ openBtn }) => {
  const formId = 'save-files-form';
  const { dataEntityId } = useAppParams();

  const { mutate: saveFiles, isLoading, isSuccess } = useSaveDataEntityFiles();

  const [uploadedFiles, setUploadedFiles] = useState<Blob[]>([]);
  const { reset, handleSubmit, control } = useForm<FormData>({
    defaultValues: { files: [] },
    mode: 'onChange',
  });

  const clearState = () => reset();

  const onSubmit = () => {
    saveFiles({ dataEntityId, files: uploadedFiles });
  };

  const handleFileDelete = useCallback(
    (index: number) => () => {
      const newFiles = [...uploadedFiles];
      newFiles.splice(index, 1);
      setUploadedFiles(newFiles);
    },
    [uploadedFiles]
  );

  const formTitle = (
    <Typography variant='h4' component='span'>
      Add files
    </Typography>
  );

  const handleFilesUpload = useCallback(
    (onChange: (val: unknown) => void) => (files: File[] | null | undefined) => {
      if (files) {
        setUploadedFiles(prev => [...prev, ...files]);
        onChange(files);
      }
    },
    []
  );

  const formContent = () => (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='files'
        control={control}
        render={({ field: { onChange } }) => (
          <FileInput onFilesSelected={handleFilesUpload(onChange)} />
        )}
      />
      <Grid container flexDirection='column' mt={2}>
        {uploadedFiles.map(({ name, size, type }, idx) => (
          <FileItem
            key={`${name}-${size}`}
            name={name}
            size={size}
            type={type}
            handleDelete={handleFileDelete(idx)}
          />
        ))}
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
      disabled={uploadedFiles.length === 0}
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
