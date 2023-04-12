import styled from 'styled-components';
import { type DataEntityClassNameEnum } from 'generated-sources';
import { Box } from '@mui/material';

export const Content = styled(Box)<{
  $entityClassName?: DataEntityClassNameEnum;
  $large?: boolean;
}>(({ theme, $entityClassName, $large }) => ({
  display: 'inline-flex',
  padding: theme.spacing($large ? 0.5 : 0.25, $large ? 1.5 : 0.5),
  borderRadius: '4px',
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
  color: theme.palette.text.primary,
  backgroundColor: $entityClassName ? theme.palette.entityClass[$entityClassName] : '',
}));
