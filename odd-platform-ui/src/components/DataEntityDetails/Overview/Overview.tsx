import { Grid, Typography } from '@mui/material';
import React from 'react';
import { DataEntityDetails } from 'generated-sources';
import OverviewSkeleton from 'components/DataEntityDetails/Overview/OverviewSkeleton/OverviewSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import OverviewDescriptionContainer from './OverviewDescription/OverviewDescriptionContainer';
import OverviewMetadataContainer from './OverviewMetadata/OverviewMetadataContainer';
import OverviewStatsContainer from './OverviewStats/OverviewStatsContainer';
import OverviewTags from './OverviewTags/OverviewTags';
import { SectionContainer } from './OverviewStyles';
import OverviewGeneralContainer from './OverviewGeneral/OverviewGeneralContainer';
import OverviewDataQualityReportContainer from './OverviewDataQualityReport/OverviewDataQualityReportContainer';
import OverviewTermsContainer from './OverviewTerms/OverviewTermsContainer';

interface OverviewProps {
  dataEntityId: number;
  dataEntityDetails: DataEntityDetails;
  isDataset: boolean;
  isDataEntityDetailsFetching: boolean;
}

const Overview: React.FC<OverviewProps> = ({
  dataEntityId,
  dataEntityDetails,
  isDataset,
  isDataEntityDetailsFetching,
}) => (
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
          {isDataset ? (
            <SectionContainer square elevation={0}>
              <OverviewDataQualityReportContainer
                dataEntityId={dataEntityId}
              />
            </SectionContainer>
          ) : null}
          <SectionContainer square elevation={0}>
            <OverviewTags
              tags={dataEntityDetails.tags}
              dataEntityId={dataEntityId}
            />
          </SectionContainer>
          <SectionContainer square elevation={0}>
            <OverviewTermsContainer
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

export default Overview;
