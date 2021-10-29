import React from 'react';
import * as S from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestionStyles';

interface AutocompleteSuggestionProps {
  optionLabel: string;
  optionName: string | undefined;
}

const AutocompleteSuggestion: React.FC<AutocompleteSuggestionProps> = ({
  optionLabel,
  optionName,
}) => (
  <S.Container variant="body2">
    <S.NoResultText>No result.</S.NoResultText>{' '}
    <S.CreateNewOptionText>
      Create new {optionLabel} &quot;{optionName}&quot;
    </S.CreateNewOptionText>
  </S.Container>
);

export default AutocompleteSuggestion;
