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
    const succRelation =
      ($testReport?.successTotal || 0) / ($testReport?.total || 1);
    const otherStatusesAdjustment =
      200 / (Math.round(1 - succRelation) + 1);

    const calculateSuccessMaxWidth = (
      totalPercentTestReport: number
    ): string =>
      `${
        (totalPercentTestReport * 200) /
        (Math.round(totalPercentTestReport) + 1)
      }%`;
    const calculateOtherStatusesMaxWidth = (
      testRunStatus: DataEntityRunStatus,
      adjustment: number,
      testReport?: DataSetTestReport
    ): number => {
      const keyTestRunStatus =
        `${testRunStatus.toLowerCase()}Total` as keyof DataSetTestReport;
      const runStatusTotalTestReport =
        (testReport && testReport[keyTestRunStatus]) || 0;
      const totalPercentTestReport =
        runStatusTotalTestReport / (testReport?.total || 1);
      return totalPercentTestReport * adjustment;
    };
    const calculatedMaxWidth =
      $testRunStatus === DataEntityRunStatus.SUCCESS
        ? calculateSuccessMaxWidth(succRelation)
        : `${calculateOtherStatusesMaxWidth(
            $testRunStatus,
            otherStatusesAdjustment,
            $testReport
          )}%`;
    return {
      backgroundColor: theme.palette.runStatus[$testRunStatus],
      height: '8px',
      width: '100%',
      maxWidth: calculatedMaxWidth,
    };
  }
);
