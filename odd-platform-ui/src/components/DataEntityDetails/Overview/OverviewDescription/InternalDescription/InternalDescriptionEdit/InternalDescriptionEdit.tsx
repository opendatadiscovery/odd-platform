import React, { type FC } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button, Markdown } from 'components/shared/elements';
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
}) => {
  const { t } = useTranslation();

  return (
    <Box onKeyDown={handlePressEnter} sx={{ pt: error ? 0 : 2.5 }}>
      <Typography mb={0.5} variant='subtitle1' color='error'>
        {error}
      </Typography>
      <Markdown editor value={value} onChange={handleMarkdownChange} height={200} />
      <S.ActionsContainer>
        <Button
          text={t('Save')}
          onClick={handleUpdateDescription}
          buttonType='main-m'
          sx={{ mr: 1 }}
        />
        <Button text={t('Cancel')} onClick={toggleEditMode} buttonType='secondary-m' />
      </S.ActionsContainer>
    </Box>
  );
};

export default InternalDescriptionEdit;
