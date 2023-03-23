import React, { useMemo } from 'react';
import { useAppParams } from 'lib/hooks';
import { useDataEntityGroupLineage } from 'lib/hooks/api';
import { useAtom } from 'jotai';
import { AppCircularProgress, EmptyContentPlaceholder } from 'components/shared';
import DEGLineageLayouter from './DEGLineageLayouter/DEGLineageLayouter';
import { isLayoutedAtom } from './lib/atoms';
import ZoomableDEGLineage from './ZoomableDEGLineage/ZoomableDEGLineage';
import * as S from './DEGLineage.styles';

const DEGLineage: React.FC = () => {
  const { dataEntityId } = useAppParams();

  // DEG data
  const { data, isLoading, isSuccess, isFetching } = useDataEntityGroupLineage({
    dataEntityId,
  });
  const rawNodes = useMemo(() => [...(data?.nodes || [])], [data?.nodes]);
  const rawEdges = useMemo(() => [...(data?.edges || [])], [data?.edges]);

  // // large mock data
  // const [downstream] = useDataEntityLineage({ dataEntityId });
  // const { data, isLoading, isSuccess, isFetching } = downstream;
  // const rawNodes = useMemo(() => uniqBy([...(data?.nodes || [])], 'id'), [data?.nodes]);
  // const rawEdges = useMemo(() => [...(data?.edges || [])], [data?.edges]);

  const [isLayouted] = useAtom(isLayoutedAtom);

  if (!isLoading && isSuccess && rawNodes.length === 0) {
    return <EmptyContentPlaceholder />;
  }

  return (
    <S.Container>
      {(!isLayouted || isFetching || isLoading) && rawNodes.length !== 0 && (
        <>
          <S.LoaderContainer>
            <AppCircularProgress size={16} text='Loading lineage' />
          </S.LoaderContainer>
          <DEGLineageLayouter nodes={rawNodes} edges={rawEdges} />
        </>
      )}
      {isSuccess && isLayouted && <ZoomableDEGLineage />}
    </S.Container>
  );
};

export default DEGLineage;
