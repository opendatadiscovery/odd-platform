import React from 'react';
import { Grid, Typography } from '@mui/material';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Term } from 'generated-sources';
import { AppButton, ConfirmationDialog } from 'components/shared';
import { DeleteIcon } from 'components/shared/Icons';
import { deleteTerm } from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import {
  TermSearchNameContainer,
  TermSearchResultsColContainer,
} from '../TermSearchResultsStyles';
import * as S from './TermSearchResultItemStyles';

interface TermsResultItemProps {
  termSearchResult: Term;
}

const TermSearchResultItem: React.FC<TermsResultItemProps> = ({ termSearchResult }) => {
  const dispatch = useAppDispatch();
  const { termDetailsOverviewPath } = useAppPaths();

  const termDetailsOverviewLink = termDetailsOverviewPath(termSearchResult.id);

  const handleDelete = React.useCallback(
    () => dispatch(deleteTerm({ termId: termSearchResult.id })),
    [termSearchResult, deleteTerm]
  );

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
              format(termSearchResult.createdAt, 'd MMM yyyy')}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType='colsm'>
          <Typography variant='body1' noWrap>
            {termSearchResult.updatedAt &&
              formatDistanceToNowStrict(termSearchResult.updatedAt, {
                addSuffix: true,
              })}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType='colxs'>
          <S.ActionsContainer>
            <ConfirmationDialog
              actionTitle='Are you sure you want to delete this term?'
              actionName='Delete Term'
              actionText={
                <>&quot;{termSearchResult.name}&quot; will be deleted permanently.</>
              }
              onConfirm={handleDelete}
              actionBtn={
                <AppButton size='medium' color='primaryLight' startIcon={<DeleteIcon />}>
                  Delete
                </AppButton>
              }
            />
          </S.ActionsContainer>
        </TermSearchResultsColContainer>
      </S.TermSearchResultsContainer>
    </S.TermSearchResultsItemLink>
  );
};

export default TermSearchResultItem;
