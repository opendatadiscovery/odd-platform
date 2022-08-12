import { Typography } from '@mui/material';
import styled from 'styled-components';
import { DataEntityRunStatus, DataSetTestReport } from 'generated-sources';

export const Container = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'stretch',
  alignItems: 'stretch',
  justifySelf: 'stretch',
  flexGrow: 1,
}));

interface CountLabelProps {
  $testRunStatus: DataEntityRunStatus;
}

interface BarProps extends CountLabelProps {
  $testReport?: DataSetTestReport;
}

export const CountLabel = styled(Typography)<CountLabelProps>(
  ({ theme, $testRunStatus }) => ({
    color: theme.palette.runStatus[$testRunStatus],
  })
);

export const Bar = styled('div')<BarProps>(
  ({ theme, $testRunStatus, $testReport }) => {
    const key =
      `${$testRunStatus.toLowerCase()}Total` as keyof DataSetTestReport;

    const relation = Math.round(
      (100 * ($testReport?.[key] || 0)) / ($testReport?.total || 1)
    );

    return {
      backgroundColor: theme.palette.runStatus[$testRunStatus],
      height: '8px',
      width: '100%',
      maxWidth: `${relation}%`,
    };
  }
);
