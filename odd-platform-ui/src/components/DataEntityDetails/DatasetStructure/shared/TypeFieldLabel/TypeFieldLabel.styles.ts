import { Box } from '@mui/material';
import type { DataSetFieldTypeTypeEnum } from 'generated-sources';
import styled from 'styled-components';

export const Content = styled(Box)<{
  $typeName: DataSetFieldTypeTypeEnum;
}>(({ theme, $typeName }) => ({
  width: '48px',
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
  padding: theme.spacing(0.125, 0.875),
  border: '1px solid',
  borderRadius: theme.typography.body2.fontSize,
  alignSelf: 'center',
  textAlign: 'center',
  color: theme.palette.texts.primary,
  borderColor: theme.palette.structureLabel[$typeName].border,
  backgroundColor: theme.palette.common.white,
}));
