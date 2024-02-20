import React, { useCallback, useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useGetQueryExampleDetails } from 'lib/hooks/api/dataModelling/queryExamples';
import { useAppDateTime } from 'lib/hooks';
import { AppLoadingPage } from 'components/shared/elements';
import { TimeGapIcon } from 'components/shared/icons';
import { useQueryExamplesRouteParams } from 'routes';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';
import { useResourcePermissions } from 'lib/hooks/api/permissions';
import QueryExampleDetailsTabs from './QueryExampleDetailsTabs';
import QueryExampleDetailsOverview from './QueryExampleDetailsOverview';
import QueryExampleDetailsLinkedEntities from './QueryExampleDetailsLinkedEntities';
import { QueryExampleDetailsContainerActions } from './QueryExampleDetailsContainerActions';

const QueryExampleDetailsContainer: React.FC = () => {
  const { queryExampleId: exampleId } = useQueryExamplesRouteParams();

  const { data: resourcePermissions } = useResourcePermissions({
    resourceId: exampleId,
    permissionResourceType: PermissionResourceType.QUERY_EXAMPLE,
  });

  const { data: queryExampleDetails, isLoading } = useGetQueryExampleDetails({
    exampleId,
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = useCallback(() => {
    setSelectedTab(prev => (prev === 0 ? 1 : 0));
  }, []);

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
        <Typography variant='h1'>{`Query Example #${exampleId}`}</Typography>
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
          selectedTab={selectedTab}
          onHandleTabChange={handleTabChange}
          linkedEntitiesHint={queryExampleDetails?.linkedEntities.pageInfo.total}
        />
      </Grid>
      <Grid item container gap={2} flexDirection='column' alignItems='start'>
        {selectedTab === 0 && (
          <QueryExampleDetailsOverview
            definition={queryExampleDetails.definition}
            query={queryExampleDetails.query}
          />
        )}
        {selectedTab === 1 && (
          <QueryExampleDetailsLinkedEntities
            entities={queryExampleDetails.linkedEntities.items}
          />
        )}
      </Grid>
    </Grid>
  ) : (
    <AppLoadingPage />
  );
};

export default QueryExampleDetailsContainer;
