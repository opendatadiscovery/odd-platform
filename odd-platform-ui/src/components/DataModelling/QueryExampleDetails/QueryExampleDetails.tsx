import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useGetQueryExampleDetails } from 'lib/hooks/api/dataModelling/queryExamples';
import { useAppParams } from 'lib/hooks';
import { AppLoadingPage, AppPaper, Markdown } from 'components/shared/elements';
import QueryExampleDetailsTabs from './QueryExampleDetailsTabs';

const QueryExampleDetails: React.FC = () => {
  const { queryExampleId: exampleId } = useAppParams();
  const { data: queryExampleDetails, isFetching } = useGetQueryExampleDetails({
    exampleId,
  });

  return (
    <Grid container gap={2} flexDirection='column'>
      <Grid item display='flex' alignItems='center' justifyContent='space-between'>
        <Typography variant='h1'>{`Query Example #${exampleId}`}</Typography>
      </Grid>
      <Grid item alignItems='center'>
        <QueryExampleDetailsTabs
          linkedEntitiesHint={queryExampleDetails?.linkedEntities?.pageInfo.total}
        />
      </Grid>
      {isFetching && <AppLoadingPage />}
      <Grid item container gap={2} flexDirection='column' alignItems='start'>
        {queryExampleDetails && (
          <>
            <AppPaper
              elevation={0}
              sx={theme => ({ p: theme.spacing(2), width: '100%' })}
            >
              <Typography variant='h2' mb={1}>
                Definition
              </Typography>
              <Markdown value={queryExampleDetails.definition} />
            </AppPaper>
            <AppPaper
              elevation={0}
              sx={theme => ({ p: theme.spacing(2), width: '100%' })}
            >
              <Typography variant='h2' mb={1}>
                Query
              </Typography>
              <Box
                sx={theme => ({
                  borderRadius: theme.spacing(0.5),
                  p: theme.spacing(1),
                  backgroundColor: theme.palette.backgrounds.primary,
                })}
              >
                <Typography variant='body1' color={theme => theme.palette.text.secondary}>
                  {queryExampleDetails.query}
                </Typography>
              </Box>
            </AppPaper>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default QueryExampleDetails;
