import React from 'react';
import { Skeleton } from '@mui/material';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import { HintType } from 'components/shared/AppTabs/interfaces';
import * as S from './AppTabLabelStyles';

interface AppTabLabelProps {
  name: string;
  showHint: boolean;
  isHintUpdated?: boolean;
  hint?: number | string;
  hintType?: HintType;
}

const AppTabLabel: React.FC<AppTabLabelProps> = ({
  name,
  showHint,
  hint,
  isHintUpdated,
  hintType = 'primary',
}) => {
  const getLabelContent = (hintIsUpdating?: boolean) =>
    hintIsUpdating ? (
      <S.HintContainer $hintType={hintType}>
        <Skeleton width="18px" height="27px" />
      </S.HintContainer>
    ) : (
      <S.HintContainer $hintType={hintType}>
        <NumberFormatted value={hint} precision={0} />
      </S.HintContainer>
    );

  return (
    <S.Container variant="body1" component="span">
      {name}
      {showHint && hint !== undefined
        ? getLabelContent(isHintUpdated)
        : null}
    </S.Container>
  );
};
export default AppTabLabel;
