import React from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import {
  DataEntityApiDeleteTermFromDataEntityRequest,
  TermRef,
} from 'generated-sources';
import TermItem from 'components/shared/TermItem/TermItem';
import AddIcon from 'components/shared/Icons/AddIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import AddTermsFormContainer from './AddTermsForm/AddTermsFormContainer';
import { TermsCaptionContainer } from './OverviewTermsStyles';

interface OverviewTermsProps {
  dataEntityId: number;
  terms?: TermRef[];
  deleteDataEntityTerm: (
    params: DataEntityApiDeleteTermFromDataEntityRequest
  ) => Promise<void>;
}

const OverviewTerms: React.FC<OverviewTermsProps> = ({
  terms,
  dataEntityId,
  deleteDataEntityTerm,
}) => {
  const visibleLimit = 20;
  const [viewAll, setViewAll] = React.useState(false);
  return (
    <div>
      <TermsCaptionContainer>
        <Typography variant="h4">Dictionary terms</Typography>
        <AddTermsFormContainer
          dataEntityId={dataEntityId}
          btnCreateEl={
            <AppButton
              size="medium"
              color="primaryLight"
              onClick={() => {}}
              startIcon={<AddIcon />}
            >
              Add terms
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
              <TermItem
                key={term.id}
                term={term}
                dataEntityId={dataEntityId}
                deleteDataEntityTerm={deleteDataEntityTerm}
              />
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
                          term={term}
                          dataEntityId={dataEntityId}
                          deleteDataEntityTerm={deleteDataEntityTerm}
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
          <AddTermsFormContainer
            dataEntityId={dataEntityId}
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
