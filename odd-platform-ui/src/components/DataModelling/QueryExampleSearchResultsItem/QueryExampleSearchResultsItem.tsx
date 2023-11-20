import { Box, Grid, Typography } from '@mui/material';
import TruncateMarkup from 'react-truncate-markup';
import React from 'react';
import type { QueryExample } from 'generated-sources';
import { useAppPaths, useScrollBarWidth } from 'lib/hooks';
import { TruncatedCell } from 'components/shared/elements';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';

const StyledGridContainer = styled(Grid)<{ $scrollbarWidth: string }>(
  ({ theme, $scrollbarWidth }) => css`
    padding-right: ${$scrollbarWidth};
    height: ${theme.spacing(9)};
    border-bottom: 1px solid ${theme.palette.divider};
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    &:hover {
      background-color: ${theme.palette.backgrounds.primary};
      cursor: pointer;
    }
  `
);

interface QueryExampleSearchResultsItemProps {
  queryExample: QueryExample;
}

const QueryExampleSearchResultsItem = ({
  queryExample,
}: QueryExampleSearchResultsItemProps) => {
  const scrollbarWidth = useScrollBarWidth();
  const navigate = useNavigate();
  const { queryExamplePath } = useAppPaths();

  return (
    <StyledGridContainer
      onClick={() => navigate(queryExamplePath(queryExample.id))}
      key={queryExample.id}
      container
      $scrollbarWidth={scrollbarWidth}
    >
      <Grid item xs={4} sx={theme => ({ py: theme.spacing(2), px: theme.spacing(1) })}>
        <Typography variant='body1'>{queryExample.definition}</Typography>
      </Grid>
      <Grid item xs={5} p={theme => theme.spacing(1)} alignItems='center'>
        <Box
          sx={theme => ({
            borderRadius: theme.spacing(0.5),
            p: theme.spacing(1),
            backgroundColor: theme.palette.backgrounds.primary,
          })}
        >
          <TruncateMarkup lines={2}>
            <Typography variant='body1' color={theme => theme.palette.text.secondary}>
              {queryExample.query}
            </Typography>
          </TruncateMarkup>
        </Box>
      </Grid>
      <Grid item xs={3} p={theme => theme.spacing(1)} alignItems='center'>
        <TruncatedCell dataList={queryExample.linkedEntities} externalEntityId={1} />
      </Grid>
    </StyledGridContainer>
  );
};

export default QueryExampleSearchResultsItem;
