import React from 'react';

import * as S from './DatasetStructureKeyFieldLabelStyles';

interface DatasetStructureKeyFieldLabelProps {
  typeName: string;
}

const DatasetStructureKeyFieldLabel: React.FC<
  DatasetStructureKeyFieldLabelProps
> = ({ typeName }) => (
  <S.Container title={typeName}>
    <S.FilledContainer>{typeName}</S.FilledContainer>
  </S.Container>
);

export default DatasetStructureKeyFieldLabel;
