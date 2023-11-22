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
      <Markdown value={query} />
    </AppPaper>
  </>
);

export default QueryExampleDetailsOverview;
