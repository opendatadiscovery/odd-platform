import React from 'react';
import { SxProps } from '@mui/system';
import { Theme, Typography } from '@mui/material';
import { NoResultText, CreateNewOptionText } from './AutocompleteSuggestionStyles';

interface AutocompleteSuggestionProps {
  optionLabel: string;
  optionName: string | undefined;
  sx?: SxProps<Theme>;
}

const AutocompleteSuggestion: React.FC<AutocompleteSuggestionProps> = ({
  optionLabel,
  optionName,
  sx,
}) => (
  <Typography sx={sx} variant='body2' component='span'>
    <NoResultText>No result.</NoResultText>{' '}
    <CreateNewOptionText>
      Create new {optionLabel} &quot;{optionName}&quot;
    </CreateNewOptionText>
  </Typography>
);

export default AutocompleteSuggestion;
