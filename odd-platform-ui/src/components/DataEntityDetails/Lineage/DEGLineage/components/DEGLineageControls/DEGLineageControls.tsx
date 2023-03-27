import React, { type FC, useCallback } from 'react';
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

  const handleFitClick = useCallback(() => {
    setIsFitClicked(prev => !prev);
    setQueryParams(prev => ({ ...prev, x: undefined, y: undefined, s: undefined }));
  }, [setQueryParams, setIsFitClicked]);

  return (
    <S.ControlsContainer>
      <AppButton
        color='primaryLight'
        size='medium'
        startIcon={<TargetIcon />}
        onClick={handleFitClick}
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
