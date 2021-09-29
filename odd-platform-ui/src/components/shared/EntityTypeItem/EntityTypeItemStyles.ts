import { styled } from '@mui/material/styles';
import { DataEntityTypeNameEnum } from 'generated-sources';

export const Content = styled('span')<{
  typeName: DataEntityTypeNameEnum;
  fullName?: boolean;
  ml?: number;
}>(({ theme, typeName, fullName, ml }) => ({
  display: 'inline-flex',
  padding: theme.spacing(0.25, fullName ? 0.5 : 0.56),
  borderRadius: '4px',
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.entityType[typeName],
  marginLeft: theme.spacing(ml !== undefined ? ml : 0.5),
  '&:first-of-type': { marginLeft: 0 },
}));
