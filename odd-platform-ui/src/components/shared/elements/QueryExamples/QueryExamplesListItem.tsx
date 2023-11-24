import { Grid } from '@mui/material';
import React from 'react';
import type { QueryExample } from 'generated-sources';
import { useAppPaths, useScrollBarWidth } from 'lib/hooks';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import TruncatedCell from '../TruncatedCell/TruncatedCell';
import Markdown from '../Markdown/Markdown';
import CollapsibleInfoContainer from '../CollapsibleInfoContainer/CollapsibleInfoContainer';

const StyledGridContainer = styled(Grid)<{ $scrollbarWidth: string }>(
  ({ theme, $scrollbarWidth }) => css`
    padding-right: ${$scrollbarWidth};
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

const QueryExamplesListItem = ({ queryExample }: QueryExampleSearchResultsItemProps) => {
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
      <Grid item xs={4} p={1}>
        <CollapsibleInfoContainer
          style={{ border: 'none' }}
          initialMaxHeight={96}
          content={<Markdown value={queryExample.definition} disableCopy />}
        />
      </Grid>
      <Grid item xs={5} p={1}>
        <CollapsibleInfoContainer
          style={{ border: 'none' }}
          initialMaxHeight={96}
          content={<Markdown value={queryExample.query} disableCopy />}
        />
      </Grid>
      <Grid item xs={3} p={1} alignItems='center'>
        <TruncatedCell dataList={queryExample.linkedEntities} externalEntityId={1} />
      </Grid>
    </StyledGridContainer>
  );
};

export default QueryExamplesListItem;
