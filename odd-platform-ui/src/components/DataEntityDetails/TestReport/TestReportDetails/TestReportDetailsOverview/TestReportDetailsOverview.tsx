import React, { ChangeEvent } from 'react';
import { Grid, Typography } from '@mui/material';
import TestReportDetailsOverviewSkeleton from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverviewSkeleton/TestReportDetailsOverviewSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { format, formatDistanceStrict } from 'date-fns';
import {
  DataQualityTest,
  DataQualityTestSeverity,
} from 'generated-sources';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { useAppDispatch } from 'lib/redux/hooks';
import { setDataQATestSeverity } from 'redux/thunks';
import { useAppParams } from 'lib/hooks';

interface TestReportDetailsOverviewProps {
  qualityTest: DataQualityTest;
  isDatasetTestListFetching: boolean;
}

const TestReportDetailsOverview: React.FC<
  TestReportDetailsOverviewProps
> = ({ qualityTest, isDatasetTestListFetching }) => {
  const dispatch = useAppDispatch();
  const { dataEntityId, dataQATestId } = useAppParams();

  const handleSeverityChange = (e: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      setDataQATestSeverity({
        dataEntityId,
        dataqaTestId: dataQATestId,
        body: e.target.value,
      })
    );

  return (
    <Grid container direction="column">
      {isDatasetTestListFetching ? (
        <SkeletonWrapper
          renderContent={({ randomSkeletonPercentWidth }) => (
            <TestReportDetailsOverviewSkeleton
              width={randomSkeletonPercentWidth()}
            />
          )}
        />
      ) : (
        <>
          <Grid sx={{ mt: 2 }}>
            <LabeledInfoItem label="Date" inline labelWidth={4}>
              {qualityTest?.latestRun?.startTime &&
                format(
                  qualityTest?.latestRun?.startTime,
                  'd MMM yyyy, HH:MM a'
                )}
            </LabeledInfoItem>
            <LabeledInfoItem label="Duration" inline labelWidth={4}>
              {qualityTest?.latestRun?.startTime &&
                qualityTest?.latestRun.endTime &&
                formatDistanceStrict(
                  qualityTest?.latestRun.endTime,
                  qualityTest?.latestRun.startTime,
                  {
                    addSuffix: false,
                  }
                )}
            </LabeledInfoItem>
            <LabeledInfoItem label="Severity" inline labelWidth={4}>
              <AppTextField
                select
                size="small"
                defaultValue={
                  qualityTest?.severity || DataQualityTestSeverity.AVERAGE
                }
                onChange={handleSeverityChange}
              >
                {Object.keys(DataQualityTestSeverity)?.map(severity => (
                  <AppMenuItem key={severity} value={severity}>
                    {severity}
                  </AppMenuItem>
                ))}
              </AppTextField>
            </LabeledInfoItem>
          </Grid>
          <Grid sx={{ mt: 2 }}>
            {qualityTest?.expectation &&
              Object.entries(qualityTest.expectation).map(
                ([key, value]) =>
                  value && (
                    <LabeledInfoItem
                      key={key}
                      label={key}
                      inline
                      labelWidth={4}
                    >
                      {value}
                    </LabeledInfoItem>
                  )
              )}
          </Grid>
          <Grid sx={{ mt: 2 }}>
            <Typography variant="h4">Links</Typography>
            <Grid container item xs={4} sx={{ mt: 1 }}>
              {qualityTest?.linkedUrlList?.map(link => (
                <Typography variant="body1">{link}</Typography>
              ))}
            </Grid>
          </Grid>
          <Grid sx={{ mt: 2 }}>
            <Typography variant="h4">Execution</Typography>
            <Grid container item xs={12} sx={{ mt: 1 }}>
              <Typography variant="body2" color="texts.secondary">
                No information about test execution is available.
              </Typography>
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default TestReportDetailsOverview;
