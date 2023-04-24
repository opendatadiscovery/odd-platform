import React from 'react';
import { type DataEntityTypeNameEnum } from 'generated-sources';
import { type SxProps } from '@mui/system';
import { type Theme } from '@mui/material';
import { stringFormatted } from 'lib/helpers';
import * as S from 'components/shared/elements/EntityTypeItem/EntityTypeItemStyles';

export interface EntityTypeItemProps {
  entityTypeName: DataEntityTypeNameEnum | 'DCT';
  sx?: SxProps<Theme>;
}

const EntityTypeItem: React.FC<EntityTypeItemProps> = ({ entityTypeName, sx }) => (
  <S.Content sx={sx} variant='body2' title={stringFormatted(entityTypeName, '_', 'all')}>
    {stringFormatted(entityTypeName, '_', 'all')}
  </S.Content>
);

export default EntityTypeItem;
