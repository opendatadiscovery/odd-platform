import { Typography } from '@mui/material';
import styled from 'styled-components';
import { DataEntityRunStatus, DataSetTestReport } from 'generated-sources';
import compact from 'lodash/compact';

interface CountLabelProps {
  $testRunStatus: DataEntityRunStatus;
}

interface BarProps extends CountLabelProps {
  $testReport: DataSetTestReport;
}

export const Container = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'stretch',
  alignItems: 'stretch',
  justifySelf: 'stretch',
  flexGrow: 1,
}));

export const CountLabel = styled(Typography)<CountLabelProps>(
  ({ theme, $testRunStatus }) => ({
    color: theme.palette.runStatus[$testRunStatus],
  })
);

export const Bar = styled('div')<BarProps>(
  ({ theme, $testRunStatus, $testReport }) => {
    const key =
      `${$testRunStatus.toLowerCase()}Total` as keyof DataSetTestReport;
    const getNonNullValuesNum = (arr: (number | undefined)[]) =>
      compact(arr).length || 1;
    const getRelation = (nonNullValNum: number, total: number) =>
      Math.fround(
        (100 * nonNullValNum * ($testReport?.[key] || 0)) / total
      );
    const getResultStyles = (relation: number) => ({
      backgroundColor: theme.palette.runStatus[$testRunStatus],
      height: '8px',
      width: '100%',
      flexBasis: `${relation}%`,
      maxWidth: `${relation}%`,
      flexGrow: $testReport?.[key] ? 1 : 0,
    });

    const {
      successTotal,
      failedTotal,
      skippedTotal,
      brokenTotal,
      unknownTotal,
      abortedTotal,
      total,
    } = $testReport;

    let barTotal = total || 1;
    let nonNullValuesNum: number;
    let relation: number;

    if (
      $testRunStatus === DataEntityRunStatus.FAILED ||
      $testRunStatus === DataEntityRunStatus.SUCCESS
    ) {
      nonNullValuesNum = getNonNullValuesNum([successTotal, failedTotal]);
      barTotal = (successTotal || 0) + (failedTotal || 0);
      relation = getRelation(nonNullValuesNum, barTotal);
      return getResultStyles(relation);
    }

    nonNullValuesNum = getNonNullValuesNum([
      abortedTotal,
      skippedTotal,
      brokenTotal,
      unknownTotal,
    ]);
    relation = getRelation(nonNullValuesNum, barTotal);

    return getResultStyles(relation);
  }
);
