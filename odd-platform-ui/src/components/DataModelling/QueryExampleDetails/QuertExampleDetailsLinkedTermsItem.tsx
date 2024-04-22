import type { TermRef } from 'generated-sources';
import { Box, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { termDetailsPath } from 'routes';

interface QuertExampleDetailsLinkedTermsItemProps {
  term: TermRef;
}

const QuertExampleDetailsLinkedTermsItem = ({
  term,
}: QuertExampleDetailsLinkedTermsItemProps) => {
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
      <Grid container item xs={2} pl={1}>
        <Box display='flex' flexWrap='nowrap' alignItems='center' overflow='hidden'>
          <Typography ml={0.5} variant='body1' noWrap title={term.name}>
            {term.name}
          </Typography>
        </Box>
      </Grid>
      <Grid container item xs={4} pl={1}>
        <Typography variant='body1' title={term.namespace.name} noWrap>
          {term.namespace.name}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default QuertExampleDetailsLinkedTermsItem;
