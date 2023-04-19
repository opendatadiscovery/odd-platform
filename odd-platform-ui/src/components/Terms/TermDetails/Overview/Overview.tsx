import { Grid, Typography } from '@mui/material';
import React from 'react';
import { SkeletonWrapper } from 'components/shared/elements';
import { useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import {
  getTermDetails,
  getTermDetailsFetchingStatuses,
} from 'redux/selectors/terms.selectors';
import { Permission, PermissionResourceType } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { getResourcePermissions } from 'redux/selectors';
import OverviewGeneral from './OverviewGeneral/OverviewGeneral';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import { SectionContainer, SectionFlexContainer } from './OverviewStyles';
import OverviewTags from './OverviewTags/OverviewTags';

const Overview: React.FC = () => {
  const { termId } = useAppParams();

  const termDetails = useAppSelector(getTermDetails(termId));
  const termPermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.TERM, termId)
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
              <Typography variant='h4'>{termDetails.name}</Typography>
              <Typography variant='body1'>-</Typography>
              <Typography variant='body1'>{termDetails.definition}</Typography>
            </SectionFlexContainer>
          </Grid>
          <Grid item xs={4}>
            <SectionContainer square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[
                  Permission.TERM_OWNERSHIP_CREATE,
                  Permission.TERM_OWNERSHIP_UPDATE,
                  Permission.TERM_OWNERSHIP_DELETE,
                ]}
                resourcePermissions={termPermissions}
                Component={OverviewGeneral}
              />
            </SectionContainer>
            <SectionContainer square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[Permission.TERM_TAGS_UPDATE]}
                resourcePermissions={termPermissions}
                render={() => <OverviewTags tags={termDetails.tags} />}
              />
            </SectionContainer>
          </Grid>
        </Grid>
      )}
      {isTermDetailsFetching && (
        <SkeletonWrapper
          renderContent={({ randWidth }) => <OverviewSkeleton width={randWidth()} />}
        />
      )}
    </>
  );
};

export default Overview;
