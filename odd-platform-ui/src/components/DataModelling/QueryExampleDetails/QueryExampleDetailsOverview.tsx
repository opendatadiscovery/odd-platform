import { AppPaper, Markdown } from 'components/shared/elements';
import { Box, Typography } from '@mui/material';
import React from 'react';

interface QueryExampleDetailsOverviewProps {
  definition: string;
  query: string;
}

const QueryExampleDetailsOverview = ({
  definition,
  query,
}: QueryExampleDetailsOverviewProps) => (
  <>
    <AppPaper elevation={0} sx={theme => ({ p: theme.spacing(2), width: '100%' })}>
      <Typography variant='h2' mb={1}>
        Definition
      </Typography>
      <Markdown value={definition} />
    </AppPaper>
    <AppPaper elevation={0} sx={theme => ({ p: theme.spacing(2), width: '100%' })}>
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
          {query}
        </Typography>
      </Box>
    </AppPaper>
  </>
);

export default QueryExampleDetailsOverview;
