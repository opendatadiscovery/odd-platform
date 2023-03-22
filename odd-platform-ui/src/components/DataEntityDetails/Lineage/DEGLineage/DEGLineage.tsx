import React from 'react';
import { useAppParams } from 'lib/hooks';
import ZoomableDEGLineage from './ZoomableDEGLineage/ZoomableDEGLineage';
import * as S from './DEGLineage.styles';
import DEGLineageAtomProvider from './lib/DEGLineageAtomProvider';

const DEGLineage: React.FC = () => {
  const { dataEntityId } = useAppParams();

  return (
    <DEGLineageAtomProvider>
      <S.Container>
        <ZoomableDEGLineage />
      </S.Container>
    </DEGLineageAtomProvider>
  );
};

export default DEGLineage;
