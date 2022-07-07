import { Grid, Typography } from '@mui/material';
import React from 'react';
import { useAppParams } from 'lib/hooks';
import {
  getDataEntityDetails,
  getDataEntityDetailsFetching,
  getDataEntityIsDataset,
} from 'redux/selectors/dataentity.selectors';
import { getDatasetTestReport } from 'redux/selectors/dataQualityTest.selectors';
import { useAppSelector } from 'lib/redux/hooks';
import OverviewSkeleton from 'components/DataEntityDetails/Overview/OverviewSkeleton/OverviewSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import OverviewGroups from 'components/DataEntityDetails/Overview/OverviewGroups/OverviewGroups';
import OverviewDescriptionContainer from './OverviewDescription/OverviewDescriptionContainer';
import OverviewMetadataContainer from './OverviewMetadata/OverviewMetadataContainer';
import OverviewStatsContainer from './OverviewStats/OverviewStatsContainer';
import OverviewTags from './OverviewTags/OverviewTags';

import { SectionContainer } from './OverviewStyles';
import OverviewGeneralContainer from './OverviewGeneral/OverviewGeneralContainer';
import OverviewDataQualityReport from './OverviewDataQualityReport/OverviewDataQualityReport';
import OverviewTerms from './OverviewTerms/OverviewTerms';

const Overview: React.FC = () => {
  const { dataEntityId } = useAppParams();

  const dataEntityDetails = useAppSelector(state =>
    getDataEntityDetails(state, dataEntityId)
  );
  const isDataset = useAppSelector(state =>
    getDataEntityIsDataset(state, dataEntityId)
  );
  const isDataEntityDetailsFetching = useAppSelector(
    getDataEntityDetailsFetching
  );
  const datasetQualityTestReport = useAppSelector(state =>
    getDatasetTestReport(state, dataEntityId)
  );
  return (
    <>
      {dataEntityDetails && !isDataEntityDetailsFetching ? (
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={8}>
            <SectionContainer elevation={9}>
              <OverviewStatsContainer dataEntityId={dataEntityId} />
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
              <OverviewDescriptionContainer dataEntityId={dataEntityId} />
            </SectionContainer>
          </Grid>
          <Grid item xs={4}>
            <SectionContainer square elevation={0}>
              <OverviewGeneralContainer
                dataEntityId={dataEntityDetails.id}
              />
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
              <OverviewTags
                tags={dataEntityDetails.tags}
                dataEntityId={dataEntityId}
              />
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
