import React, { type FC } from 'react';
import { Button, Markdown } from 'components/shared/elements';
import { Box, Typography } from '@mui/material';
import * as S from './InternalDescriptionEdit.styles';

interface InternalDescriptionEditProps {
  value: string;
  handlePressEnter: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleMarkdownChange: (val: string | undefined) => void;
  handleUpdateDescription: () => void;
  toggleEditMode: () => void;
  error?: string;
}

const InternalDescriptionEdit: FC<InternalDescriptionEditProps> = ({
  value,
  handlePressEnter,
  handleMarkdownChange,
  handleUpdateDescription,
  toggleEditMode,
  error,
}) => (
  <Box onKeyDown={handlePressEnter} sx={{ pt: error ? 0 : 2.5 }}>
    <Typography mb={0.5} variant='subtitle1' color='error'>
      {error}
    </Typography>
    <Markdown editor value={value} onChange={handleMarkdownChange} height={200} />
    <S.ActionsContainer>
      <Button
        text='Save'
        onClick={handleUpdateDescription}
        buttonType='main-m'
        sx={{ mr: 1 }}
      />
      <Button text='Cancel' onClick={toggleEditMode} buttonType='secondary-m' />
    </S.ActionsContainer>
  </Box>
);

export default InternalDescriptionEdit;
