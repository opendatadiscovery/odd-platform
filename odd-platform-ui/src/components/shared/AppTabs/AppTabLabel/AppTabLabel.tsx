import React from 'react';
import { Skeleton, Typography } from '@mui/material';
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
        <Typography variant="h6" component="span">
          <NumberFormatted value={hint} precision={0} />
        </Typography>
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
