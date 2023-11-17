import { Box, Grid, Typography } from '@mui/material';
import TruncateMarkup from 'react-truncate-markup';
import React from 'react';
import type { QueryExample } from 'generated-sources';
import { useTheme } from 'styled-components';
import { useScrollBarWidth } from 'lib/hooks';
import { TruncatedCell } from '../../shared/elements';

interface QueryExampleSearchResultsItemProps {
  queryExample: QueryExample;
}

const QueryExampleSearchResultsItem = ({
  queryExample,
}: QueryExampleSearchResultsItemProps) => {
  const theme = useTheme();
  const scrollbarWidth = useScrollBarWidth();
  return (
    <Grid
      key={queryExample.definition}
      container
      sx={{ pr: scrollbarWidth }}
      borderBottom='1px solid'
      wrap='nowrap'
      borderColor={theme.palette.divider}
      height={theme.spacing(9)}
      alignItems='center'
      justifyContent='center'
    >
      <Grid item xs={4} py={theme.spacing(2)} px={theme.spacing(1)}>
        <Typography variant='body1'>{queryExample.definition}</Typography>
      </Grid>
      <Grid item xs={5} p={theme.spacing(1)} alignItems='center'>
        <Box
          sx={{
            borderRadius: theme.spacing(0.5),
            p: theme.spacing(1),
            backgroundColor: theme.palette.backgrounds.primary,
          }}
        >
          <TruncateMarkup lines={2}>
            <Typography variant='body1' color={theme.palette.text.secondary}>
              {queryExample.query}
            </Typography>
          </TruncateMarkup>
        </Box>
      </Grid>
      <Grid item xs={3} p={theme.spacing(1)} alignItems='center'>
        <TruncatedCell dataList={queryExample.linkedEntities} externalEntityId={1} />
      </Grid>
    </Grid>
  );
};

export default QueryExampleSearchResultsItem;
