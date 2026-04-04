import type { TermRef } from 'generated-sources';
import { Box, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { termDetailsPath } from 'routes';

interface QueryExampleDetailsLinkedTermsItemProps {
  term: TermRef;
}

const QueryExampleDetailsLinkedTermsItem = ({
  term,
}: QueryExampleDetailsLinkedTermsItemProps) => {
  const navigate = useNavigate();
  const onClick = useCallback(() => {
    navigate(termDetailsPath(term.id));
  }, [term.id, navigate]);

  return (
    <Grid
      onClick={onClick}
      container
      sx={theme => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1.25, 0),
        ':hover': {
          backgroundColor: `${theme.palette.backgrounds.primary}`,
          cursor: 'pointer',
        },
      })}
      wrap='nowrap'
    >
      <Grid container pl={1} size={2}>
        <Box display='flex' flexWrap='nowrap' alignItems='center' overflow='hidden'>
          <Typography ml={0.5} variant='body1' noWrap title={term.name}>
            {term.name}
          </Typography>
        </Box>
      </Grid>
      <Grid container pl={1} size={4}>
        <Typography variant='body1' title={term.namespace.name} noWrap>
          {term.namespace.name}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default QueryExampleDetailsLinkedTermsItem;
