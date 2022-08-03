import { Grid, Typography } from '@mui/material';
import React from 'react';
import { useAppParams } from 'lib/hooks';
import {
  getDataEntityDetails,
  getDataEntityDetailsFetchingStatuses,
  getDatasetTestReport,
  getIsDataEntityBelongsToClass,
} from 'redux/selectors';
import { useAppSelector } from 'lib/redux/hooks';
import { SkeletonWrapper } from 'components/shared';
import OverviewGroups from './OverviewGroups/OverviewGroups';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import OverviewDescription from './OverviewDescription/OverviewDescription';
import OverviewMetadataContainer from './OverviewMetadata/OverviewMetadataContainer';
import OverviewStats from './OverviewStats/OverviewStats';
import OverviewTags from './OverviewTags/OverviewTags';
import { SectionContainer } from './OverviewStyles';
import OverviewGeneral from './OverviewGeneral/OverviewGeneral';
import OverviewDataQualityReport from './OverviewDataQualityReport/OverviewDataQualityReport';
import OverviewTerms from './OverviewTerms/OverviewTerms';

const Overview: React.FC = () => {
  const { dataEntityId } = useAppParams();

  const dataEntityDetails = useAppSelector(
    getDataEntityDetails(dataEntityId)
  );
  const { isDataset } = useAppSelector(
    getIsDataEntityBelongsToClass(dataEntityId)
  );
  const datasetQualityTestReport = useAppSelector(state =>
    getDatasetTestReport(state, dataEntityId)
  );

  const { isLoading: isDataEntityDetailsFetching } = useAppSelector(
    getDataEntityDetailsFetchingStatuses
  );

  return (
    <>
      {dataEntityDetails && !isDataEntityDetailsFetching ? (
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={8}>
            <SectionContainer elevation={9}>
              <OverviewStats />
            </SectionContainer>
            <Typography variant="h3" sx={{ mt: 3, mb: 1 }}>
              Metadata
            </Typography>
            <SectionContainer square elevation={0}>
              <OverviewMetadataContainer dataEntityId={dataEntityId} />
            </SectionContainer>
            <Typography variant="h3" sx={{ mt: 3, mb: 1 }}>
              About
            </Typography>
            <SectionContainer square elevation={0}>
              <OverviewDescription />
            </SectionContainer>
          </Grid>
          <Grid item xs={4}>
            <SectionContainer square elevation={0}>
              <OverviewGeneral />
            </SectionContainer>
            {isDataset && datasetQualityTestReport?.total ? (
              <SectionContainer square elevation={0}>
                <OverviewDataQualityReport dataEntityId={dataEntityId} />
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
          renderContent={({ randomSkeletonPercentWidth }) => (
            <OverviewSkeleton width={randomSkeletonPercentWidth()} />
          )}
        />
      ) : null}
    </>
  );
};
export default Overview;
