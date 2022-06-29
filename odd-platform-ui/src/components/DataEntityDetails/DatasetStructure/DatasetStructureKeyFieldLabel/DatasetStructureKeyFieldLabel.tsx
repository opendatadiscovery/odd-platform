import React from 'react';
import type { DatasetFieldKeyType } from './DatasetStructureKeyFieldLabelStyles';
import * as S from './DatasetStructureKeyFieldLabelStyles';

interface DatasetStructureKeyFieldLabelProps {
  typeName: DatasetFieldKeyType;
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
