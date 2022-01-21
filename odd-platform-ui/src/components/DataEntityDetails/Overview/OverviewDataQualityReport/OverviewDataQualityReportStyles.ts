import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  DataQualityTestRunStatusEnum,
  DataSetTestReport,
} from 'generated-sources';
import { propsChecker } from 'lib/helpers';

export const Container = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'stretch',
  alignItems: 'stretch',
  justifySelf: 'stretch',
  flexGrow: 1,
}));

export const CountLabel = styled(Typography, {
  shouldForwardProp: propsChecker,
})<{
  $testRunStatus: DataQualityTestRunStatusEnum;
}>(({ theme, $testRunStatus }) => ({
  color: theme.palette.runStatus[$testRunStatus],
}));

export const Bar = styled('div', { shouldForwardProp: propsChecker })<{
  $testReport?: DataSetTestReport;
  $testRunStatus: DataQualityTestRunStatusEnum;
}>(({ theme, $testRunStatus, $testReport }) => {
  const succRelation =
    ($testReport?.successTotal || 0) / ($testReport?.total || 1);
  const otherStatusesAdjustment = 200 / (Math.round(1 - succRelation) + 1);
  const success = {
    backgroundColor: theme.palette.runStatus[$testRunStatus],
    maxWidth: `${(succRelation * 200) / (Math.round(succRelation) + 1)}%`,
  };
  const fail = {
    backgroundColor: theme.palette.runStatus[$testRunStatus],
    maxWidth: `${
      ((($testReport &&
        $testReport[
          `${$testRunStatus.toLowerCase()}Total` as keyof DataSetTestReport
        ]) ||
        0) /
        ($testReport?.total || 1)) *
      otherStatusesAdjustment
    }%`,
  };
  return {
    height: '8px',
    width: '100%',
    ...($testRunStatus === DataQualityTestRunStatusEnum.SUCCESS
      ? success
      : fail),
  };
});
