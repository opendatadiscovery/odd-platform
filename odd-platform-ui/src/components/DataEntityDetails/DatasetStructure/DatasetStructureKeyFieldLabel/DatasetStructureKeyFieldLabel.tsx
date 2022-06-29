import React from 'react';

import * as S from './DatasetStructureKeyFieldLabelStyles';

type KeyType = 'Primary' | 'Sort';
interface DatasetStructureKeyFieldLabelProps {
  typeName: KeyType;
}

const DatasetStructureKeyFieldLabel: React.FC<
  DatasetStructureKeyFieldLabelProps
> = ({ typeName }) => (
  <S.Container title={typeName}>
    <S.FilledContainer $typeName={typeName}>
      {typeName} key
    </S.FilledContainer>
  </S.Container>
);

export default DatasetStructureKeyFieldLabel;
