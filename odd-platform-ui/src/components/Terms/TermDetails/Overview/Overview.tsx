import { Grid, Typography } from '@mui/material';
import React from 'react';
import OverviewSkeleton from 'components/DataEntityDetails/Overview/OverviewSkeleton/OverviewSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import OverviewGeneral from 'components/Terms/TermDetails/Overview/OverviewGeneral/OverviewGeneral';
import { useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import {
  getTermDetails,
  getTermDetailsFetchingStatuses,
} from 'redux/selectors/terms.selectors';
import { SectionContainer, SectionFlexContainer } from './OverviewStyles';
import OverviewTags from './OverviewTags/OverviewTags';

const Overview: React.FC = () => {
  const { termId } = useAppParams();

  const termDetails = useAppSelector(state =>
    getTermDetails(state, termId)
  );

  const { isLoading: isTermDetailsFetching } = useAppSelector(
    getTermDetailsFetchingStatuses
  );

  return (
    <>
      {termDetails && !isTermDetailsFetching && (
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={8}>
            <SectionFlexContainer elevation={9}>
              <Typography variant="h4">{termDetails.name}</Typography>
              <Typography variant="body1">-</Typography>
              <Typography variant="body1">
                {termDetails.definition}
              </Typography>
            </SectionFlexContainer>
          </Grid>
          <Grid item xs={4}>
            <SectionContainer square elevation={0}>
              <OverviewGeneral />
            </SectionContainer>
            <SectionContainer square elevation={0}>
              <OverviewTags tags={termDetails.tags} />
            </SectionContainer>
          </Grid>
        </Grid>
      )}
      {isTermDetailsFetching && (
        <SkeletonWrapper
          renderContent={({ randWidth }) => (
            <OverviewSkeleton width={randWidth()} />
          )}
        />
      )}
    </>
  );
};

export default Overview;
