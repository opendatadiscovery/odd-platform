import React from 'react';
import { DataSetFieldTypeKeyEnum } from 'generated-sources';

import * as S from './DatasetStructureKeyFieldLabelStyles';

interface DatasetStructureKeyFieldLabelProps {
  typeName: DataSetFieldTypeKeyEnum;
}

const DatasetStructureKeyFieldLabel: React.FC<
  DatasetStructureKeyFieldLabelProps
> = ({ typeName }) => (
  <S.Container title={typeName}>
    <S.FilledContainer $typeName={typeName}>{typeName}</S.FilledContainer>
  </S.Container>
);

export default DatasetStructureKeyFieldLabel;
