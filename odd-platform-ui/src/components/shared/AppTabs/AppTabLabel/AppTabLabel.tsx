import React from 'react';
import { Skeleton } from '@mui/material';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import * as S from './AppTabLabelStyles';

interface AppTabLabelProps {
  name: string;
  showHint: boolean;
  isHintUpdated?: boolean;
  hint?: number | string;
}

const AppTabLabel: React.FC<AppTabLabelProps> = ({
  name,
  showHint,
  hint,
  isHintUpdated,
}) => {
  const getLabelContent = (hintIsUpdating?: boolean) =>
    hintIsUpdating ? (
      <S.HintContainer>
        <Skeleton width="18px" height="27px" />
      </S.HintContainer>
    ) : (
      <S.HintContainer>
        <NumberFormatted value={hint} precision={0} />
      </S.HintContainer>
    );

  return (
    <S.Container variant="body1">
      {name}
      {showHint && hint !== undefined
        ? getLabelContent(isHintUpdated)
        : null}
    </S.Container>
  );
};
export default AppTabLabel;
