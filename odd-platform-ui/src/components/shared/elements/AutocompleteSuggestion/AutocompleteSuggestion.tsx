import React from 'react';
import { type SxProps } from '@mui/system';
import { type Theme, Typography } from '@mui/material';
import {
  NoResultText,
  CreateNewOptionText,
} from 'components/shared/elements/AutocompleteSuggestion/AutocompleteSuggestionStyles';
import { useTranslation } from 'react-i18next';

interface AutocompleteSuggestionProps {
  optionLabel: string;
  optionName: string | undefined;
  sx?: SxProps<Theme>;
}

const AutocompleteSuggestion: React.FC<AutocompleteSuggestionProps> = ({
  optionLabel,
  optionName,
  sx,
}) => {
  const { t } = useTranslation();

  return (
    <Typography sx={sx} variant='body2' component='span'>
      <NoResultText>{t('No result.')}</NoResultText>{' '}
      <CreateNewOptionText>
        {t('Create new')} {optionLabel} &quot;{optionName}&quot;
      </CreateNewOptionText>
    </Typography>
  );
};

export default AutocompleteSuggestion;
