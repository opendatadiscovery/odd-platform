import React from 'react';
import { type SxProps } from '@mui/system';
import { type Theme } from '@mui/material';
import type { DatasetFieldKeyType } from './KeyFieldLabelStyles';
import * as S from './KeyFieldLabelStyles';

interface KeyFieldLabelProps {
  keyType: DatasetFieldKeyType;
  sx?: SxProps<Theme>;
}

const KeyFieldLabel: React.FC<KeyFieldLabelProps> = ({ keyType, sx }) => (
  <S.Container title={keyType} sx={sx}>
    <S.FilledContainer $keyType={keyType}>{keyType} key</S.FilledContainer>
  </S.Container>
);

export default KeyFieldLabel;
