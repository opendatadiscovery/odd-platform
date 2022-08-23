import React from 'react';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material';
import type { DatasetFieldKeyType } from './DatasetStructureKeyFieldLabelStyles';
import * as S from './DatasetStructureKeyFieldLabelStyles';

interface DatasetStructureKeyFieldLabelProps {
  keyType: DatasetFieldKeyType;
  sx?: SxProps<Theme>;
}

const DatasetStructureKeyFieldLabel: React.FC<
  DatasetStructureKeyFieldLabelProps
> = ({ keyType, sx }) => (
  <S.Container title={keyType} sx={sx}>
    <S.FilledContainer $keyType={keyType}>{keyType} key</S.FilledContainer>
  </S.Container>
);

export default DatasetStructureKeyFieldLabel;
