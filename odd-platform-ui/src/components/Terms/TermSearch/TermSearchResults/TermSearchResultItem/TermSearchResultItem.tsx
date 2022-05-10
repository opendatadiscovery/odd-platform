import React from 'react';
import { Grid, Typography } from '@mui/material';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Term, TermApiDeleteTermRequest } from 'generated-sources';
import { termDetailsOverviewPath } from 'lib/paths';
import AppButton from 'components/shared/AppButton/AppButton';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import {
  TermSearchNameContainer,
  TermSearchResultsColContainer,
} from 'components/Terms/TermSearch/TermSearchResults/TermSearchResultsStyles';
import {
  TermSearchResultsContainer,
  TermSearchResultsItemLink,
} from './TermSearchResultItemStyles';

interface TermsResultItemProps {
  termSearchResult: Term;
  deleteTerm: (params: TermApiDeleteTermRequest) => Promise<void>;
}

const TermSearchResultItem: React.FC<TermsResultItemProps> = ({
  termSearchResult,
  deleteTerm,
}) => {
  const termDetailsOverviewLink = termDetailsOverviewPath(
    termSearchResult.id
  );
  const handleDelete = React.useCallback(
    () => deleteTerm({ termId: termSearchResult.id }),
    [termSearchResult, deleteTerm]
  );

  return (
    <TermSearchResultsItemLink to={termDetailsOverviewLink}>
      <TermSearchResultsContainer container>
        <TermSearchResultsColContainer item $colType="collg">
          <TermSearchNameContainer container item>
            <Typography variant="body1" noWrap>
              {termSearchResult.name}
            </Typography>
          </TermSearchNameContainer>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="collg">
          <Typography
            variant="body1"
            title={termSearchResult.namespace.name}
            noWrap
          >
            {termSearchResult.namespace.name}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="collg">
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
          <Typography variant="body1" noWrap>
            {termSearchResult.createdAt &&
              format(termSearchResult.createdAt, 'd MMM yyyy')}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colsm">
          <Typography variant="body1" noWrap>
            {termSearchResult.updatedAt &&
              formatDistanceToNowStrict(termSearchResult.updatedAt, {
                addSuffix: true,
              })}
          </Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colxs">
          <ConfirmationDialog
            actionTitle="Are you sure you want to delete this term?"
            actionName="Delete Term"
            actionText={
              <>
                &quot;{termSearchResult.name}&quot; will be deleted
                permanently.
              </>
            }
            onConfirm={handleDelete}
            actionBtn={
              <AppButton
                size="medium"
                color="primaryLight"
                startIcon={<DeleteIcon />}
              >
                Delete
              </AppButton>
            }
          />
        </TermSearchResultsColContainer>
      </TermSearchResultsContainer>
    </TermSearchResultsItemLink>
  );
};

export default TermSearchResultItem;
