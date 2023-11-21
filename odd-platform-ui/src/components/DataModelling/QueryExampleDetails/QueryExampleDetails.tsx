import React, { useCallback, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { useGetQueryExampleDetails } from 'lib/hooks/api/dataModelling/queryExamples';
import { useAppParams } from 'lib/hooks';
import { AppLoadingPage } from 'components/shared/elements';
import QueryExampleDetailsTabs from './QueryExampleDetailsTabs';
import QueryExampleDetailsOverview from './QueryExampleDetailsOverview';
import QueryExampleDetailsLinkedEntities from './QueryExampleDetailsLinkedEntities';

const QueryExampleDetails: React.FC = () => {
  const { queryExampleId: exampleId } = useAppParams();
  const { data: queryExampleDetails, isLoading } = useGetQueryExampleDetails({
    exampleId,
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = useCallback(() => {
    setSelectedTab(prev => (prev === 0 ? 1 : 0));
  }, []);

  return (
    <Grid container gap={2} flexDirection='column'>
      <Grid item display='flex' alignItems='center' justifyContent='space-between'>
        <Typography variant='h1'>{`Query Example #${exampleId}`}</Typography>
      </Grid>
      <Grid item alignItems='center'>
        <QueryExampleDetailsTabs
          selectedTab={selectedTab}
          onHandleTabChange={handleTabChange}
          linkedEntitiesHint={queryExampleDetails?.linkedEntities.pageInfo.total}
        />
      </Grid>
      <Grid item container gap={2} flexDirection='column' alignItems='start'>
        {queryExampleDetails && !isLoading && selectedTab === 0 && (
          <QueryExampleDetailsOverview
            definition={queryExampleDetails.definition}
            query={queryExampleDetails.query}
          />
        )}
        {queryExampleDetails && !isLoading && selectedTab === 1 && (
          <QueryExampleDetailsLinkedEntities
            entities={queryExampleDetails.linkedEntities.items}
          />
        )}
      </Grid>
      {isLoading && <AppLoadingPage />}
    </Grid>
  );
};

export default QueryExampleDetails;
