import { Box } from '@mui/material';
import { DataSetFieldTypeTypeEnum } from 'generated-sources';
import { styled } from '@mui/material/styles';

export const Content = styled(Box)<{
  typeName: DataSetFieldTypeTypeEnum;
}>(({ theme, typeName }) => ({
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
  padding: theme.spacing(0.25, 1),
  border: '1px solid',
  borderRadius: theme.typography.body2.fontSize,
  alignSelf: 'center',
  color: theme.palette.texts.primary,
  borderColor: theme.palette.structureLabel[typeName].border,
}));
