import React from 'react';
import { type SxProps } from '@mui/system';
import { type Theme } from '@mui/material';
import type { DatasetFieldKey } from 'lib/interfaces';
import * as S from './KeyFieldLabelStyles';

interface KeyFieldLabelProps {
  keyType: DatasetFieldKey;
  sx?: SxProps<Theme>;
}

const KeyFieldLabel: React.FC<KeyFieldLabelProps> = ({ keyType, sx }) => (
  <S.Container title={keyType} sx={sx}>
    <S.FilledContainer $keyType={keyType}>{`${keyType.toUpperCase()} ${
      keyType === 'nullable' ? '' : 'KEY'
    }`}</S.FilledContainer>
  </S.Container>
);

export default KeyFieldLabel;
