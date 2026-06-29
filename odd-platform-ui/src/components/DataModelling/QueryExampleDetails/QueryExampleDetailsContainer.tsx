import React, { useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useGetQueryExampleDetails } from 'lib/hooks/api/dataModelling/queryExamples';
import { useAppDateTime, useRecordRecentlyViewed } from 'lib/hooks';
import { AppLoadingPage, FavoriteStar, RecentlyViewedTag } from 'components/shared/elements';
import { TimeGapIcon } from 'components/shared/icons';
import { useQueryExamplesRouteParams } from 'routes';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { AssetKind, Permission, PermissionResourceType } from 'generated-sources';
import { useResourcePermissions } from 'lib/hooks/api/permissions';
import { useSearchParams } from 'react-router-dom';
import QueryExampleDetailsTabs from './QueryExampleDetailsTabs';
import QueryExampleDetailsOverview from './QueryExampleDetailsOverview';
import QueryExampleDetailsLinkedEntities from './QueryExampleDetailsLinkedEntities';
import QueryExampleDetailsLinkedTerms from './QueryExampleDetailsLinkedTerms';
import { QueryExampleDetailsContainerActions } from './QueryExampleDetailsContainerActions';

const QueryExampleDetailsContainer: React.FC = () => {
  const { queryExampleId: exampleId } = useQueryExamplesRouteParams();

  // Record this open in the user's Recently Viewed history (#1816).
  useRecordRecentlyViewed(AssetKind.QUERY_EXAMPLE, exampleId);

  const { data: resourcePermissions } = useResourcePermissions({
    resourceId: exampleId,
    permissionResourceType: PermissionResourceType.QUERY_EXAMPLE,
  });

  const { data: queryExampleDetails, isLoading } = useGetQueryExampleDetails({
    exampleId,
  });

  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'overview';

  const { formatDistanceToNowStrict } = useAppDateTime();

  const updatedAt = useMemo(
    () =>
      formatDistanceToNowStrict(
        queryExampleDetails ? queryExampleDetails.updatedAt : new Date(),
        { addSuffix: true }
      ),
    [queryExampleDetails?.updatedAt, formatDistanceToNowStrict]
  );

  return queryExampleDetails && !isLoading ? (
    <Grid container gap={2} flexDirection='column'>
      <Grid item display='flex' alignItems='center' justifyContent='space-between'>
        <Box display='flex' alignItems='center'>
          <Typography variant='h1'>{`Query Example #${exampleId}`}</Typography>
          <FavoriteStar assetKind={AssetKind.QUERY_EXAMPLE} assetId={exampleId} />
          <RecentlyViewedTag assetKind={AssetKind.QUERY_EXAMPLE} assetId={exampleId} />
        </Box>
        <Box display='flex' alignItems='center'>
          <TimeGapIcon />
          <Typography variant='body1' sx={{ ml: 1 }}>
            {updatedAt}
          </Typography>
          <WithPermissionsProvider
            allowedPermissions={[
              Permission.QUERY_EXAMPLE_UPDATE,
              Permission.QUERY_EXAMPLE_DELETE,
            ]}
            resourcePermissions={resourcePermissions ?? []}
            render={() => (
              <QueryExampleDetailsContainerActions
                queryExampleDetails={queryExampleDetails}
              />
            )}
          />
        </Box>
      </Grid>
      <Grid item alignItems='center'>
        <QueryExampleDetailsTabs
          linkedEntitiesHint={queryExampleDetails?.linkedEntities.pageInfo.total}
          linkedTermsHint={queryExampleDetails?.linkedTerms?.items.length}
        />
      </Grid>
      <Grid item container gap={2} flexDirection='column' alignItems='start'>
        {tab === 'overview' && (
          <QueryExampleDetailsOverview
            definition={queryExampleDetails.definition}
            query={queryExampleDetails.query}
          />
        )}
        {tab === 'linked-entities' && (
          <QueryExampleDetailsLinkedEntities
            entities={queryExampleDetails.linkedEntities.items}
          />
        )}
        {tab === 'linked-terms' && (
          <QueryExampleDetailsLinkedTerms
            terms={
              queryExampleDetails.linkedTerms.items
                ? queryExampleDetails.linkedTerms.items.map(term => term.term)
                : []
            }
          />
        )}
      </Grid>
    </Grid>
  ) : (
    <AppLoadingPage />
  );
};

export default QueryExampleDetailsContainer;
