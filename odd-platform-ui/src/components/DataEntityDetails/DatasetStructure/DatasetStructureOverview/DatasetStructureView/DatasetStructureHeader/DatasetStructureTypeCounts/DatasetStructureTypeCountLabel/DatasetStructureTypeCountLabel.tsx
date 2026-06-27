import React from 'react';
import type { BoxProps } from '@mui/material';
import { Typography } from '@mui/material';
import round from 'lodash/round';
import { DatasetTypeLabelMap } from 'redux/interfaces';
import type { DataSetFieldTypeTypeEnum } from 'generated-sources';
import * as S from './DatasetStructureTypeCountLabelStyles';

interface DatasetStructureTypeCountLabelProps extends Pick<BoxProps, 'sx'> {
  typeName: DataSetFieldTypeTypeEnum;
  count?: number;
  fieldsCount?: number;
  onClick?: () => void;
  selected?: boolean;
}

const DatasetStructureTypeCountLabel: React.FC<DatasetStructureTypeCountLabelProps> = ({
  typeName,
  count,
  fieldsCount,
  sx,
  onClick,
  selected,
}) => (
  <S.Container
    $typeName={typeName}
    $selected={selected}
    $cursorPointer={Boolean(onClick)}
    onClick={onClick}
    data-qa={onClick ? 'dataset-structure-type-filter' : undefined}
    sx={sx}
  >
    <Typography variant='h5'>{count}</Typography>
    <Typography variant='body2'>{DatasetTypeLabelMap[typeName].short}</Typography>
    <S.Divider />
    <Typography variant='body2' color='texts.hint'>
      {count && fieldsCount ? round((count * 100) / fieldsCount, 2) : 0}%
    </Typography>
  </S.Container>
);
export default DatasetStructureTypeCountLabel;
