import React from 'react';
import type { DataSetFieldTypeTypeEnum } from 'generated-sources';
import { DatasetTypeLabelMap } from 'redux/interfaces';
import type { BoxProps } from '@mui/material';
import { Typography } from '@mui/material';
import round from 'lodash/round';
import * as S from './DatasetStructureTypeCountLabelStyles';

interface DatasetStructureTypeCountLabelProps extends Pick<BoxProps, 'sx'> {
  typeName: DataSetFieldTypeTypeEnum;
  count?: number;
  fieldsCount?: number;
}

const DatasetStructureTypeCountLabel: React.FC<DatasetStructureTypeCountLabelProps> = ({
  typeName,
  count,
  fieldsCount,
  sx,
}) => (
  <S.Container $typeName={typeName} sx={sx}>
    <Typography variant='h5'>{count}</Typography>
    <Typography variant='body2'>{DatasetTypeLabelMap[typeName].short}</Typography>
    <S.Divider />
    <Typography variant='body2' color='texts.hint'>
      {count && fieldsCount ? round((count * 100) / fieldsCount, 2) : 0}%
    </Typography>
  </S.Container>
);
export default DatasetStructureTypeCountLabel;
