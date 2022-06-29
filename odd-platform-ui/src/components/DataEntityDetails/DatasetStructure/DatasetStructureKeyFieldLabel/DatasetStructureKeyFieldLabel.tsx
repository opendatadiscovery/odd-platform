import React from 'react';
import type { DatasetFieldKeyType } from './DatasetStructureKeyFieldLabelStyles';
import * as S from './DatasetStructureKeyFieldLabelStyles';

interface DatasetStructureKeyFieldLabelProps {
  keyType: DatasetFieldKeyType;
}

const DatasetStructureKeyFieldLabel: React.FC<
  DatasetStructureKeyFieldLabelProps
> = ({ keyType }) => (
  <S.Container title={keyType}>
    <S.FilledContainer $keyType={keyType}>{keyType} key</S.FilledContainer>
  </S.Container>
);

export default DatasetStructureKeyFieldLabel;
