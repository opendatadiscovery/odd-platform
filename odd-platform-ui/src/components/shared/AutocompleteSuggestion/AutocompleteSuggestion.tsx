import React from 'react';
import * as S from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestionStyles';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material';

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
  <S.Container sx={sx} variant="body2">
    <S.NoResultText>No result.</S.NoResultText>{' '}
    <S.CreateNewOptionText>
      Create new {optionLabel} &quot;{optionName}&quot;
    </S.CreateNewOptionText>
  </S.Container>
);

export default AutocompleteSuggestion;
