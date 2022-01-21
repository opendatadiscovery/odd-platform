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
  $dataQualityTestRunStatus: DataQualityTestRunStatusEnum;
}>(({ theme, $dataQualityTestRunStatus }) => ({
  color: theme.palette.runStatus[$dataQualityTestRunStatus],
}));

export const Bar = styled('div', { shouldForwardProp: propsChecker })<{
  $datasetQualityTestReport?: DataSetTestReport;
  $dataQualityTestRunStatus: DataQualityTestRunStatusEnum;
}>(({ theme, $dataQualityTestRunStatus, $datasetQualityTestReport }) => {
  const succRelation =
    ($datasetQualityTestReport?.successTotal || 0) /
    ($datasetQualityTestReport?.total || 1);
  const otherStatusesAdjustment = 200 / (Math.round(1 - succRelation) + 1);
  const success = {
    backgroundColor: theme.palette.runStatus[$dataQualityTestRunStatus],
    maxWidth: `${(succRelation * 200) / (Math.round(succRelation) + 1)}%`,
  };
  const fail = {
    backgroundColor: theme.palette.runStatus[$dataQualityTestRunStatus],
    maxWidth: `${
      ((($datasetQualityTestReport &&
        $datasetQualityTestReport[
          `${$dataQualityTestRunStatus.toLowerCase()}Total` as keyof DataSetTestReport
        ]) ||
        0) /
        ($datasetQualityTestReport?.total || 1)) *
      otherStatusesAdjustment
    }%`,
  };
  return {
    height: '8px',
    width: '100%',
    ...($dataQualityTestRunStatus === DataQualityTestRunStatusEnum.SUCCESS
      ? success
      : fail),
  };
});
