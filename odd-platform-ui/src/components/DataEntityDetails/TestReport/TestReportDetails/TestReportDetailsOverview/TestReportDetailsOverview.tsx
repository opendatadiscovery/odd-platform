import React from 'react';
import { Grid, SelectChangeEvent, Typography } from '@mui/material';
import TestReportDetailsOverviewSkeleton from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverviewSkeleton/TestReportDetailsOverviewSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { format, formatDistanceStrict } from 'date-fns';
import { DataQualityTestSeverity } from 'generated-sources';
import {
  getDatasetTestListFetchingStatuses,
  getQualityTestByTestId,
} from 'redux/selectors/dataQualityTest.selectors';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { setDataQATestSeverity } from 'redux/thunks';
import { useAppParams } from 'lib/hooks';
import AppSelect from 'components/shared/AppSelect/AppSelect';

const TestReportDetailsOverview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId, dataQATestId } = useAppParams();
  const { isLoading: isDatasetTestListFetching } = useAppSelector(
    getDatasetTestListFetchingStatuses
  );
  const qualityTest = useAppSelector(state =>
    getQualityTestByTestId(state, dataQATestId)
  );

  const handleSeverityChange = (e: SelectChangeEvent<unknown>) =>
    dispatch(
      setDataQATestSeverity({
        dataEntityId,
        dataqaTestId: dataQATestId,
        dataQualityTestSeverityForm: {
          severity: e.target.value as DataQualityTestSeverity,
        },
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
            <LabeledInfoItem
              label="Severity"
              inline
              labelWidth={4}
              valueComponent="div"
            >
              <AppSelect
                size="small"
                defaultValue={
                  qualityTest?.severity || DataQualityTestSeverity.MAJOR
                }
                onChange={handleSeverityChange}
              >
                {Object.keys(DataQualityTestSeverity)?.map(severity => (
                  <AppMenuItem key={severity} value={severity}>
                    {severity}
                  </AppMenuItem>
                ))}
              </AppSelect>
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
