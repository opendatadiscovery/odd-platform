import React, { type FC, useCallback, useRef } from 'react';
import { Typography } from '@mui/material';
import Button from 'components/shared/elements/Button/Button';
import { bytesToMb } from 'lib/helpers';
import * as S from './FileInput.styles';

const DEFAULT_MAX_FILE_SIZE_IN_BYTES = 20000000;

export interface FileInputProps {
  onFilesSelected: (files: File[] | null | undefined) => void;
  maxFileSizeInBytes?: number;
  hint?: string;
  multiple?: boolean;
}

const FileInput: FC<FileInputProps> = ({
  maxFileSizeInBytes = DEFAULT_MAX_FILE_SIZE_IN_BYTES,
  onFilesSelected,
  hint = `The maximum file size should not exceed ${bytesToMb(maxFileSizeInBytes)} Mb`,
  multiple = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const filterFiles = useCallback((files: FileList | null | undefined) => {
    if (!files) return null;

    return Array.from(files).filter(file => file.size <= maxFileSizeInBytes);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const { files } = event.dataTransfer;
      const filteredFiles = filterFiles(files);
      onFilesSelected(filteredFiles);
    },
    [onFilesSelected]
  );

  const handleInputChange = useCallback(() => {
    const files = inputRef.current?.files;
    const filteredFiles = filterFiles(files);
    onFilesSelected(filteredFiles);
  }, [onFilesSelected]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <S.Container>
      <S.Input
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <S.InputContent>
          <Typography variant='subtitle1' mr={0.5}>
            Drag & drop or
          </Typography>
          <Button text='browse' buttonType='link-m' onClick={handleClick} />
        </S.InputContent>
        <input
          ref={inputRef}
          type='file'
          onChange={handleInputChange}
          style={{ display: 'none' }}
          multiple={multiple}
        />
      </S.Input>
      {hint && (
        <Typography variant='subtitle2' mt={1}>
          {hint}
        </Typography>
      )}
    </S.Container>
  );
};

export default FileInput;
