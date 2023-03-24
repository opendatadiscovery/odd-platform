import React, { type FC } from 'react';
import { AppButton, AppTabs } from 'components/shared';
import { TargetIcon } from 'components/shared/Icons';
import { useQueryParams } from 'lib/hooks';
import { useSetAtom } from 'jotai/index';
import type { DEGLineageQueryParams } from '../../lib/interfaces';
import { defaultDEGLineageQuery } from '../../lib/constants';
import { isFitClickedAtom, isLayoutedAtom } from '../../lib/atoms';
import * as S from './DEGLineageControls.styles';

const DEGLineageControls: FC = () => {
  const {
    queryParams: { full },
    setQueryParams,
  } = useQueryParams<DEGLineageQueryParams>(defaultDEGLineageQuery);
  const setIsLayouted = useSetAtom(isLayoutedAtom);
  const setIsFitClicked = useSetAtom(isFitClickedAtom);

  const handleViewChange = React.useCallback(
    (newViewIndex: number) => {
      setQueryParams(prev => ({ ...prev, full: !(newViewIndex > 0) }));
      setIsLayouted(false);
    },
    [setQueryParams, setIsLayouted]
  );

  return (
    <S.ControlsContainer>
      <AppButton
        color='primaryLight'
        size='medium'
        startIcon={<TargetIcon />}
        onClick={() => setIsFitClicked(prev => !prev)}
      >
        Fit
      </AppButton>
      <AppTabs
        type='secondarySmall'
        orientation='horizontal'
        items={[{ name: 'Full' }, { name: 'Compact' }]}
        selectedTab={full ? 0 : 1}
        handleTabChange={handleViewChange}
      />
    </S.ControlsContainer>
  );
};

export default DEGLineageControls;
