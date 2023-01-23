import React from 'react';
import type { DataSetFieldTypeTypeEnum } from 'generated-sources';
import { DatasetTypeLabelMap } from 'redux/interfaces';
import type { BoxProps } from '@mui/material';
import * as S from './DatasetFieldTypeLabelStyles';

interface DatasetStructureFieldTypeLabelProps extends Pick<BoxProps, 'sx'> {
  typeName: DataSetFieldTypeTypeEnum;
}

const DatasetFieldTypeLabel: React.FC<DatasetStructureFieldTypeLabelProps> = ({
  typeName,
  sx,
}) => (
  <S.Content component='span' sx={sx} $typeName={typeName}>
    {DatasetTypeLabelMap.get(typeName)?.short}
  </S.Content>
);

export default DatasetFieldTypeLabel;
