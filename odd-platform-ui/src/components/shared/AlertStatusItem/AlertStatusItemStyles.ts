import { AlertStatus } from 'generated-sources';
import { styled } from '@mui/material/styles';
import { shouldForwardProp } from 'lib/helpers';

interface FilledContainerProps {
  $typeName: AlertStatus;
}

const typeChecker = (type: AlertStatus) =>
  type === 'OPEN' ? 'OPEN' : 'RESOLVED';

export const Container = styled('div')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
}));

export const FilledContainer = styled(
  'span',
  shouldForwardProp(['$typeName'])
)<FilledContainerProps>(({ theme, $typeName }) => ({
  fontSize: theme.typography.body2.fontSize,
  lineHeight: theme.typography.body2.lineHeight,
  borderRadius: '12px',
  border: '1px solid',
  padding: theme.spacing(0.25, 1),
  backgroundColor: theme.palette.alert[typeChecker($typeName)].background,
  borderColor: theme.palette.alert[typeChecker($typeName)].border,
}));
