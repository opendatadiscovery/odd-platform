import React from 'react';
import type { DataSetFieldTypeTypeEnum } from 'generated-sources';
import { DatasetTypeLabelMap } from 'redux/interfaces';
import type { BoxProps } from '@mui/material';
import * as S from './TypeFieldLabel.styles';

interface DatasetStructureFieldTypeLabelProps extends Pick<BoxProps, 'sx'> {
  typeName: DataSetFieldTypeTypeEnum;
}

const TypeFieldLabel: React.FC<DatasetStructureFieldTypeLabelProps> = ({
  typeName,
  sx,
}) => (
  <S.Content component='span' sx={sx} $typeName={typeName}>
    {DatasetTypeLabelMap[typeName].short}
  </S.Content>
);

export default TypeFieldLabel;
