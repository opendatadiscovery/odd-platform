import React from 'react';
import { Grid, Typography } from '@mui/material';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Term } from 'generated-sources';
import { termDetailsPath } from 'lib/paths';
import { TermSearchResultsColContainer } from 'components/TermSearch/TermSearchResults/TermSearchResultsStyles';
import {
  TermSearchResultsContainer,
  TermSearchResultsItemLink,
} from './TermSearchResultItemStyles';

interface TermsResultItemProps {
  termSearchResult: Term;
}

const TermSearchResultItem: React.FC<TermsResultItemProps> = ({
  termSearchResult,
}) => {
  const detailsLink = termDetailsPath(termSearchResult.id);

  return (
    <TermSearchResultsItemLink to={detailsLink}>
      <TermSearchResultsContainer container>
        <TermSearchResultsColContainer item $colType="colmd">
          <Typography variant="body1" noWrap>
            {termSearchResult.name}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colmd">
          <Typography variant="body1" noWrap>
            {termSearchResult.namespace}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colmd">
          <Grid container direction="column" alignItems="flex-start">
            {termSearchResult.ownership?.map(ownership => (
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
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colxs">
          <Typography variant="body1" noWrap>
            {termSearchResult.entitiesUsingCount}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colsm">
          <Typography
            variant="body1"
            title={
              termSearchResult.createdAt
                ? format(termSearchResult.createdAt, 'd MMM yyyy')
                : undefined
            }
            noWrap
          >
            {termSearchResult.createdAt
              ? format(termSearchResult.createdAt, 'd MMM yyyy')
              : null}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colmd">
          <Typography
            variant="body1"
            title={
              termSearchResult.updatedAt
                ? formatDistanceToNowStrict(termSearchResult.updatedAt, {
                    addSuffix: true,
                  })
                : undefined
            }
            noWrap
          >
            {termSearchResult.updatedAt
              ? formatDistanceToNowStrict(termSearchResult.updatedAt, {
                  addSuffix: true,
                })
              : null}
          </Typography>
        </TermSearchResultsColContainer>
      </TermSearchResultsContainer>
    </TermSearchResultsItemLink>
  );
};

export default TermSearchResultItem;
