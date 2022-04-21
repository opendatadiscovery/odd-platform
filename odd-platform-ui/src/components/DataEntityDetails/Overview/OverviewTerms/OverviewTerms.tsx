import React from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import { TermRef } from 'generated-sources';
import TermItem from 'components/shared/TermItem/TermItem';
import EditIcon from 'components/shared/Icons/EditIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import { TermsCaptionContainer } from './OverviewTermsStyles';
// import TermsAddFormContainer from './TermsAddForm/TermsAddFormContainer';
import TermsFormContainer from '../../../TermSearch/TermForm/TermsFormContainer';

interface OverviewTermsProps {
  // dataEntityId: number;
  terms?: TermRef[];
}

const OverviewTerms: React.FC<OverviewTermsProps> = ({
  terms,
  // dataEntityId,
}) => {
  const visibleLimit = 20;
  const [viewAll, setViewAll] = React.useState(false);
  return (
    <div>
      <TermsCaptionContainer>
        <Typography variant="h4">Dictionary terms</Typography>
        <TermsFormContainer
          // <TermsAddFormContainer
          // dataEntityId={dataEntityId}
          btnCreateEl={
            <AppButton
              size="medium"
              color="primaryLight"
              onClick={() => {}}
              startIcon={terms?.length ? <EditIcon /> : <AddIcon />}
            >
              {terms?.length ? 'Edit' : 'Add'} terms
            </AppButton>
          }
        />
      </TermsCaptionContainer>
      {terms?.length ? (
        <Box sx={{ mx: -0.5, my: 0 }}>
          {terms
            .slice(0, visibleLimit)
            .sort()
            .map(term => (
              <TermItem key={term.id} label={term.name} sx={{ m: 0.5 }} />
            ))}
          {terms?.length > visibleLimit ? (
            <>
              <Collapse in={viewAll} timeout="auto" unmountOnExit>
                {viewAll
                  ? terms
                      ?.slice(visibleLimit)
                      .sort()
                      .map(term => (
                        <TermItem
                          key={term.id}
                          label={term.name}
                          sx={{ m: 0.5 }}
                        />
                      ))
                  : null}
              </Collapse>
              <AppButton
                size="small"
                color="tertiary"
                sx={{ display: 'flex', ml: 0.5, mt: 1.25 }}
                onClick={() => setViewAll(!viewAll)}
              >
                {viewAll ? 'Hide' : `View All (${terms?.length})`}
              </AppButton>
            </>
          ) : null}
        </Box>
      ) : (
        <Grid
          item
          xs={12}
          container
          alignItems="center"
          justifyContent="flex-start"
          wrap="nowrap"
        >
          <Typography variant="subtitle2">Not created.</Typography>
          {/* <TermsAddFormContainer */}
          <TermsFormContainer
            // dataEntityId={dataEntityId}
            btnCreateEl={
              <AppButton size="small" color="tertiary" onClick={() => {}}>
                Add terms
              </AppButton>
            }
          />
        </Grid>
      )}
    </div>
  );
};

export default OverviewTerms;
