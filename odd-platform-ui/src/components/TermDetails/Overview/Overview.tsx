import { Grid, Typography } from '@mui/material';
import React from 'react';
import { TermDetails } from 'generated-sources';
import OverviewSkeleton from 'components/DataEntityDetails/Overview/OverviewSkeleton/OverviewSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import OverviewTags from './OverviewTags/OverviewTags';
import { SectionContainer } from './OverviewStyles';
import OverviewGeneralContainer from './OverviewGeneral/OverviewGeneralContainer';

interface OverviewProps {
  termId: number;
  termDetails: TermDetails;
  isTermDetailsFetching: boolean;
}

const Overview: React.FC<OverviewProps> = ({
  termId,
  termDetails,
  isTermDetailsFetching,
}) => (
  <>
    {termDetails && !isTermDetailsFetching ? (
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={8}>
          <SectionContainer elevation={9}>
            <Typography variant="h4">{termDetails.name}</Typography>
            <Typography variant="body1">
              - {termDetails.definition}
            </Typography>
          </SectionContainer>
        </Grid>
        <Grid item xs={4}>
          <SectionContainer square elevation={0}>
            <OverviewGeneralContainer termId={termDetails.id} />
          </SectionContainer>
          <SectionContainer square elevation={0}>
            <OverviewTags tags={termDetails.tags} termId={termId} />
          </SectionContainer>
        </Grid>
      </Grid>
    ) : null}
    {isTermDetailsFetching ? (
      <SkeletonWrapper
        renderContent={({ randomSkeletonPercentWidth }) => (
          <OverviewSkeleton width={randomSkeletonPercentWidth()} />
        )}
      />
    ) : null}
  </>
);

export default Overview;
