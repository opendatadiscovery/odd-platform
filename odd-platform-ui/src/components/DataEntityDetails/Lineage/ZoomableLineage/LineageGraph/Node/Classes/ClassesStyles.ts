import styled from 'styled-components';
import { type DataEntityClassNameEnum } from 'generated-sources';

export const EntityClassContainer = styled('rect')<{
  $entityClassName: DataEntityClassNameEnum;
}>(({ theme, $entityClassName }) => ({
  fill: theme.palette.entityClass[$entityClassName],
  rx: 4,
}));

export const TypeLabel = styled('text')(({ theme }) => ({
  fill: theme.palette.common.black,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
  textAnchor: 'middle',
}));
