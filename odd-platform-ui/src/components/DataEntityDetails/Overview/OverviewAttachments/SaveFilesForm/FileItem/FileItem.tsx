import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import { Button } from 'components/shared/elements';
import { ClearIcon, DocumentIcon, ImageIcon } from 'components/shared/icons';
import { bytesToKb } from 'lib/helpers';
import * as S from './FileItem.styles';

interface FileItemProps {
  name: string;
  type: string;
  size: number;
  handleDelete: () => void;
}

const FileItem: FC<FileItemProps> = ({ name, size, type, handleDelete }) => {
  const isImage = type.includes('image');

  return (
    <S.Container>
      {isImage ? <ImageIcon /> : <DocumentIcon />}
      <S.ContentWrapper>
        <S.ContentContainer>
          <Typography variant='body2' noWrap>
            {name}
          </Typography>
          <Typography
            variant='caption'
            sx={{ whiteSpace: 'nowrap', ml: 0.5 }}
          >{`${bytesToKb(size)} kb`}</Typography>
        </S.ContentContainer>
        <Button buttonType='linkGray-m' icon={<ClearIcon />} onClick={handleDelete} />
      </S.ContentWrapper>
    </S.Container>
  );
};

export default FileItem;
