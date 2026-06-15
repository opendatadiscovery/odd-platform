import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useDataEntityGroupLineage } from 'lib/hooks/api';
import { AppCircularProgress, EmptyContentPlaceholder } from 'components/shared/elements';
import { useDataEntityRouteParams } from 'routes';
import DEGLineageControls from './components/DEGLineageControls/DEGLineageControls';
import DEGLineageLayouter from './DEGLineageLayouter/DEGLineageLayouter';
import { isLayoutedAtom } from './lib/atoms';
import ZoomableDEGLineage from './ZoomableDEGLineage/ZoomableDEGLineage';
import * as S from './DEGLineage.styles';

const DEGLineage: React.FC = () => {
  const { t } = useTranslation();
  const { dataEntityId } = useDataEntityRouteParams();

  const { data, isLoading, isSuccess, isFetching } = useDataEntityGroupLineage({
    dataEntityId,
  });
  const rawNodes = useMemo(() => [...(data?.nodes || [])], [data?.nodes]);
  const rawEdges = useMemo(() => [...(data?.edges || [])], [data?.edges]);

  const [isLayouted] = useAtom(isLayoutedAtom);

  if (!isLoading && isSuccess && rawNodes.length === 0) {
    return <EmptyContentPlaceholder />;
  }

  return (
    <S.Container>
      {(!isLayouted || isFetching || isLoading) && rawNodes.length !== 0 && (
        <>
          <S.LoaderContainer>
            <AppCircularProgress size={16} text={t('Loading lineage')} />
          </S.LoaderContainer>
          <DEGLineageLayouter nodes={rawNodes} edges={rawEdges} />
        </>
      )}
      {isSuccess && isLayouted && (
        <S.LineageViewContainer>
          <DEGLineageControls />
          <ZoomableDEGLineage />
        </S.LineageViewContainer>
      )}
    </S.Container>
  );
};

export default DEGLineage;
