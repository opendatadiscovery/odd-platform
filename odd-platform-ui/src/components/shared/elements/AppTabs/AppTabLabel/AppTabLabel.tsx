import React from 'react';
import { Skeleton } from '@mui/material';
import NumberFormatted from 'components/shared/elements/NumberFormatted/NumberFormatted';
import { type HintType } from 'components/shared/elements/AppTabs/interfaces';
import * as S from 'components/shared/elements/AppTabs/AppTabLabel/AppTabLabelStyles';

interface AppTabLabelProps {
  name: string;
  showHint: boolean;
  isHintUpdating?: boolean;
  hint?: number | string;
  hintType?: HintType;
}

const AppTabLabel: React.FC<AppTabLabelProps> = ({
  name,
  showHint,
  hint,
  isHintUpdating,
  hintType = 'primary',
}) => {
  const labelContent = React.useMemo(
    () =>
      isHintUpdating ? (
        <S.HintContainer $hintType={hintType}>
          <Skeleton width='18px' height='27px' />
        </S.HintContainer>
      ) : (
        <S.HintContainer $hintType={hintType}>
          <NumberFormatted value={hint} precision={0} />
        </S.HintContainer>
      ),
    [isHintUpdating, hintType, hint]
  );
  return (
    <S.Container variant='body1' component='span'>
      {name}
      {showHint && hint !== undefined ? labelContent : null}
    </S.Container>
  );
};
export default AppTabLabel;
