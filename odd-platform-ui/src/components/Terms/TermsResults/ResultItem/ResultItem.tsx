import React from 'react';
import { Grid, Typography } from '@mui/material';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { TermDetails } from 'generated-sources';
import { dataEntityDetailsPath } from 'lib/paths';
import { ColContainer } from 'components/Search/Results/ResultsStyles';
import { Container, ItemLink } from './ResultItemStyles';

interface ResultItemProps {
  searchResult: TermDetails;
}

const ResultItem: React.FC<ResultItemProps> = ({ searchResult }) => {
  const detailsLink = dataEntityDetailsPath(searchResult.id || 0);

  return (
    <ItemLink to={detailsLink}>
      <Container container>
        <ColContainer item $colType="colmd">
          <Typography variant="body1" noWrap>
            {searchResult.name}
          </Typography>
        </ColContainer>
        <ColContainer item $colType="colmd">
          <Typography variant="body1" noWrap>
            {searchResult.namespace}
          </Typography>
        </ColContainer>
        <ColContainer item $colType="colmd">
          <Grid container direction="column" alignItems="flex-start">
            {searchResult.ownership?.map(ownership => (
              <Grid item key={ownership.id}>
                <Typography
                  variant="body1"
                  title={ownership.owner.name}
                  noWrap
                >
                  {ownership.owner.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </ColContainer>
        <ColContainer item $colType="colxs">
          <Typography variant="body1" noWrap>
            {searchResult.definition}
          </Typography>
        </ColContainer>
        <ColContainer item $colType="colsm">
          <Typography
            variant="body1"
            title={
              searchResult.createdAt
                ? format(searchResult.createdAt, 'd MMM yyyy')
                : undefined
            }
            noWrap
          >
            {searchResult.createdAt
              ? format(searchResult.createdAt, 'd MMM yyyy')
              : null}
          </Typography>
        </ColContainer>
        <ColContainer item $colType="colmd">
          <Typography
            variant="body1"
            title={
              searchResult.updatedAt
                ? formatDistanceToNowStrict(searchResult.updatedAt, {
                    addSuffix: true,
                  })
                : undefined
            }
            noWrap
          >
            {searchResult.updatedAt
              ? formatDistanceToNowStrict(searchResult.updatedAt, {
                  addSuffix: true,
                })
              : null}
          </Typography>
        </ColContainer>
      </Container>
    </ItemLink>
  );
};

export default ResultItem;
