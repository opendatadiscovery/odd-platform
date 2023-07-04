import React, { type FC } from 'react';
import { Button, Markdown } from 'components/shared/elements';
import { Box, Typography } from '@mui/material';
import * as S from './InternalDescriptionEdit.styles';

interface InternalDescriptionEditProps {
  value: string;
  handlePressEnter: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleMarkdownChange: (val: string | undefined) => void;
  handleUpdateDescription: () => void;
  handleTurnOffEditMode: () => void;
  error?: string;
}

// TODO check re-renders, memo if needed
const InternalDescriptionEdit: FC<InternalDescriptionEditProps> = ({
  value,
  handlePressEnter,
  handleMarkdownChange,
  handleUpdateDescription,
  handleTurnOffEditMode,
  error,
}) => (
  <Box onKeyDown={handlePressEnter}>
    <Markdown editor value={value} onChange={handleMarkdownChange} height={200} />
    <S.ActionsContainer>
      <Button
        text='Save'
        onClick={handleUpdateDescription}
        buttonType='main-m'
        sx={{ mr: 1 }}
      />
      <Button text='Cancel' onClick={handleTurnOffEditMode} buttonType='secondary-m' />
      <Typography variant='subtitle2' color='error'>
        {error}
      </Typography>
    </S.ActionsContainer>
  </Box>
);

export default InternalDescriptionEdit;
