import { type AlertStatus } from 'generated-sources';
import styled from 'styled-components';

interface FilledContainerProps {
  $status: AlertStatus;
}

const statusChecker = (status: AlertStatus) => (status === 'OPEN' ? 'OPEN' : 'RESOLVED');

export const Container = styled('div')(() => ({
  display: 'inline-flex',
  alignItems: 'center',
}));

export const FilledContainer = styled('span')<FilledContainerProps>(
  ({ theme, $status }) => ({
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    borderRadius: '12px',
    border: '1px solid',
    padding: theme.spacing(0.25, 1),
    backgroundColor: theme.palette.alert[statusChecker($status)].background,
    borderColor: theme.palette.alert[statusChecker($status)].border,
  })
);
