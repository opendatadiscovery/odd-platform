import { Grid, Typography } from '@mui/material';
import React from 'react';
import { useAppParams } from 'lib/hooks';
import {
  getDataEntityDetails,
  getDataEntityDetailsFetchingStatuses,
  getDatasetTestReport,
  getIsDataEntityBelongsToClass,
} from 'redux/selectors';
import { hasDataQualityTestExpectations } from 'lib/helpers';
import { SkeletonWrapper } from 'components/shared';
import { useAppSelector } from 'redux/lib/hooks';
import OverviewDQTestReport from './OverviewDataQualityReport/OverviewDQTestReport/OverviewDQTestReport';
import OverviewDQSLAReport from './OverviewDataQualityReport/OverviewDQSLAReport/OverviewDQSLAReport';
import OverviewExpectations from './OverviewExpectations/OverviewExpectations';
import OverviewGroups from './OverviewGroups/OverviewGroups';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import OverviewDescription from './OverviewDescription/OverviewDescription';
import OverviewMetadata from './OverviewMetadata/OverviewMetadata';
import OverviewStats from './OverviewStats/OverviewStats';
import OverviewTags from './OverviewTags/OverviewTags';
import { SectionContainer } from './OverviewStyles';
import OverviewGeneral from './OverviewGeneral/OverviewGeneral';
import OverviewTerms from './OverviewTerms/OverviewTerms';

const Overview: React.FC = () => {
  const { dataEntityId } = useAppParams();

  const dataEntityDetails = useAppSelector(getDataEntityDetails(dataEntityId));
  const { isDataset } = useAppSelector(getIsDataEntityBelongsToClass(dataEntityId));
  const datasetQualityTestReport = useAppSelector(getDatasetTestReport(dataEntityId));

  const { isLoading: isDataEntityDetailsFetching } = useAppSelector(
    getDataEntityDetailsFetchingStatuses
  );

  return (
    <>
      {dataEntityDetails && !isDataEntityDetailsFetching ? (
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item lg={9}>
            <SectionContainer elevation={9}>
              <OverviewStats />
            </SectionContainer>
            {hasDataQualityTestExpectations(dataEntityDetails?.expectation) && (
              <>
                <Typography variant='h3' sx={{ mt: 3, mb: 1 }}>
                  Expectations
                </Typography>
                <SectionContainer square elevation={0}>
                  <OverviewExpectations
                    parameters={dataEntityDetails.expectation}
                    linkedUrlList={dataEntityDetails.linkedUrlList}
                  />
                </SectionContainer>
              </>
            )}
            <Typography variant='h3' sx={{ mt: 3, mb: 1 }}>
              Metadata
            </Typography>
            <SectionContainer square elevation={0}>
              <OverviewMetadata dataEntityId={dataEntityId} />
            </SectionContainer>
            <Typography variant='h3' sx={{ mt: 3, mb: 1 }}>
              About
            </Typography>
            <SectionContainer square elevation={0}>
              <OverviewDescription />
            </SectionContainer>
          </Grid>
          <Grid item lg={3}>
            <SectionContainer square elevation={0}>
              <OverviewGeneral />
            </SectionContainer>
            {isDataset && datasetQualityTestReport?.total ? (
              <SectionContainer square elevation={0}>
                <OverviewDQSLAReport dataEntityId={dataEntityId} />
                <OverviewDQTestReport dataEntityId={dataEntityId} />
              </SectionContainer>
            ) : null}
            <SectionContainer square elevation={0}>
              <OverviewGroups
                dataEntityGroups={dataEntityDetails.dataEntityGroups}
                dataEntityId={dataEntityId}
              />
            </SectionContainer>
            <SectionContainer square elevation={0}>
              <OverviewTags tags={dataEntityDetails.tags} />
            </SectionContainer>
            <SectionContainer square elevation={0}>
              <OverviewTerms
                terms={dataEntityDetails.terms}
                dataEntityId={dataEntityId}
              />
            </SectionContainer>
          </Grid>
        </Grid>
      ) : null}
      {isDataEntityDetailsFetching ? (
        <SkeletonWrapper
          renderContent={({ randWidth }) => <OverviewSkeleton width={randWidth()} />}
        />
      ) : null}
    </>
  );
};
export default Overview;
