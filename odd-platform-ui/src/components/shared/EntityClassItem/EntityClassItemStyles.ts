import styled from 'styled-components';
import { DataEntityClassNameEnum } from 'generated-sources';
import { Box } from '@mui/material';

export const Content = styled(Box)<{
  $entityClassName?: DataEntityClassNameEnum;
  $fullName?: boolean;
}>(({ theme, $entityClassName, $fullName }) => ({
  display: 'inline-flex',
  padding: theme.spacing(0.25, $fullName ? 0.5 : 0.56),
  borderRadius: '4px',
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
  color: theme.palette.text.primary,
  backgroundColor: $entityClassName
    ? theme.palette.entityClass[$entityClassName]
    : '',
}));
