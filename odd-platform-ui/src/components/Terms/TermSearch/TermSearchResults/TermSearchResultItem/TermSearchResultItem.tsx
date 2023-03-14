import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type Term } from 'generated-sources';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import {
  TermSearchNameContainer,
  TermSearchResultsColContainer,
} from '../TermSearchResultsStyles';
import * as S from './TermSearchResultItemStyles';

interface TermsResultItemProps {
  termSearchResult: Term;
}

const TermSearchResultItem: React.FC<TermsResultItemProps> = ({ termSearchResult }) => {
  const { termDetailsOverviewPath } = useAppPaths();
  const { termFormattedDateTime, formatDistanceToNowStrict } = useAppDateTime();

  const termDetailsOverviewLink = termDetailsOverviewPath(termSearchResult.id);

  return (
    <S.TermSearchResultsItemLink to={termDetailsOverviewLink}>
      <S.TermSearchResultsContainer container>
        <TermSearchResultsColContainer item $colType='collg'>
          <TermSearchNameContainer container item>
            <Typography variant='body1' noWrap>
              {termSearchResult.name}
            </Typography>
          </TermSearchNameContainer>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType='collg'>
          <Typography variant='body1' title={termSearchResult.namespace.name} noWrap>
            {termSearchResult.namespace.name}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType='collg'>
          <Grid container direction='column' alignItems='flex-start'>
            {termSearchResult.ownership?.map(ownership => (
              <Grid item key={ownership.id}>
                <Typography variant='body1' title={ownership.owner.name} noWrap>
                  {ownership.owner.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType='colxs'>
          <Typography variant='body1' noWrap>
            {termSearchResult.entitiesUsingCount}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType='colsm'>
          <Typography variant='body1' noWrap>
            {termSearchResult.createdAt &&
              termFormattedDateTime(termSearchResult.createdAt.getTime())}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType='colsm'>
          <Typography variant='body1' noWrap>
            {termSearchResult.updatedAt &&
              formatDistanceToNowStrict(termSearchResult.updatedAt, { addSuffix: true })}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType='colxs' />
      </S.TermSearchResultsContainer>
    </S.TermSearchResultsItemLink>
  );
};

export default TermSearchResultItem;
