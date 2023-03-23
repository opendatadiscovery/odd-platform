import React, { useMemo } from 'react';
import { useAppParams } from 'lib/hooks';
import { useDataEntityLineage } from 'lib/hooks/api';
import uniqBy from 'lodash/uniqBy';
import DEGLineageLayouter from 'components/DataEntityDetails/Lineage/DEGLineage/DEGLineageLayouter/DEGLineageLayouter';
import { useAtom } from 'jotai';
import { isLayoutedAtom } from 'components/DataEntityDetails/Lineage/DEGLineage/lib/atoms';
import { AppCircularProgress } from 'components/shared';
import ZoomableDEGLineage from './ZoomableDEGLineage/ZoomableDEGLineage';
import * as S from './DEGLineage.styles';

const DEGLineage: React.FC = () => {
  const { dataEntityId } = useAppParams();
  const data = useDataEntityLineage({ dataEntityId });
  const [isLayouted] = useAtom(isLayoutedAtom);

  const rawNodes = useMemo(
    () => uniqBy([...(data[0]?.data?.nodes || [])], 'id'),
    [data[0]?.data?.nodes]
  );
  const rawEdges = useMemo(
    () => [...(data[0]?.data?.edges || [])],
    [data[0]?.data?.edges]
  );

  return (
    <S.Container>
      {!isLayouted && rawNodes.length !== 0 ? (
        <>
          <S.LoaderContainer>
            <AppCircularProgress size={16} text='Loading lineage' />
          </S.LoaderContainer>
          <DEGLineageLayouter nodes={rawNodes} edges={rawEdges} />
        </>
      ) : (
        <ZoomableDEGLineage />
      )}
      {rawNodes.length === 0 && <div>No DATA</div>}
    </S.Container>
  );
};

export default DEGLineage;
