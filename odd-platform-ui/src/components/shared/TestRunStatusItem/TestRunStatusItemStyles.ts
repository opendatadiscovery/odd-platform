import { DataQualityTestRunStatus } from 'generated-sources';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';

export const Container = styled('div')(() => ({
  display: 'inline-flex',
  alignItems: 'center',
}));

export const Count = styled('span')(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  lineHeight: theme.typography.body1.lineHeight,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const FilledContainer = styled('span', {
  shouldForwardProp: propsChecker,
})<{
  $typeName: DataQualityTestRunStatus;
}>(({ theme, $typeName }) => ({
  fontSize: theme.typography.body2.fontSize,
  lineHeight: theme.typography.body2.lineHeight,
  borderRadius: '12px',
  borderWidth: '1px',
  borderStyle: 'solid',
  padding: theme.spacing(0.25, 1),
  backgroundColor: theme.palette.reportStatus[$typeName].background,
  borderColor: theme.palette.reportStatus[$typeName].border,
  marginLeft: theme.spacing(0.5),
}));
