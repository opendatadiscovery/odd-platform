import { Grid, Typography } from '@mui/material';
import React, { type FC } from 'react';
import { Markdown, SkeletonWrapper } from 'components/shared/elements';
import { useAppSelector } from 'redux/lib/hooks';
import {
  getResourcePermissions,
  getTermDetails,
  getTermDetailsFetchingStatuses,
} from 'redux/selectors';
import { Permission, PermissionResourceType } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { useTermsRouteParams } from 'routes';
import OverviewGeneral from './OverviewGeneral/OverviewGeneral';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import OverviewTags from './OverviewTags/OverviewTags';
import * as S from './OverviewStyles';

const Overview: FC = () => {
  const { termId } = useTermsRouteParams();

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
            <S.DefinitionContainer elevation={9}>
              <Typography variant='h2' mb={1}>
                Definition
              </Typography>
              <Markdown value={termDetails.definition} />
            </S.DefinitionContainer>
          </Grid>
          <Grid item xs={4}>
            <S.Container square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[
                  Permission.TERM_OWNERSHIP_CREATE,
                  Permission.TERM_OWNERSHIP_UPDATE,
                  Permission.TERM_OWNERSHIP_DELETE,
                ]}
                resourcePermissions={termPermissions}
                Component={OverviewGeneral}
              />
            </S.Container>
            <S.Container square elevation={0}>
              <WithPermissionsProvider
                allowedPermissions={[Permission.TERM_TAGS_UPDATE]}
                resourcePermissions={termPermissions}
                render={() => <OverviewTags tags={termDetails.tags} />}
              />
            </S.Container>
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
