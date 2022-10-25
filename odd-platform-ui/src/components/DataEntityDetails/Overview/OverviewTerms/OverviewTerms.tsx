import React from 'react';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import { Permission, TermRef } from 'generated-sources';
import { AppButton, TermItem } from 'components/shared';
import { AddIcon } from 'components/shared/Icons';
import { PermissionProvider, WithPermissions } from 'components/shared/contexts';
import { TermsCaptionContainer } from './OverviewTermsStyles';
import AddTermsForm from './AddTermsForm/AddTermsForm';

interface OverviewTermsProps {
  dataEntityId: number;
  terms?: TermRef[];
}

const OverviewTerms: React.FC<OverviewTermsProps> = ({ terms, dataEntityId }) => {
  const visibleLimit = 20;
  const [viewAll, setViewAll] = React.useState(false);

  return (
    <div>
      <TermsCaptionContainer>
        <Typography variant='h4'>Dictionary terms</Typography>
        <PermissionProvider permissions={[Permission.DATA_ENTITY_ADD_TERM]}>
          <WithPermissions
            resourceId={dataEntityId}
            renderContent={({ isAllowedTo: addTerms }) => (
              <AddTermsForm
                dataEntityId={dataEntityId}
                btnCreateEl={
                  <AppButton
                    size='medium'
                    color='primaryLight'
                    disabled={!addTerms}
                    startIcon={<AddIcon />}
                  >
                    Add terms
                  </AppButton>
                }
              />
            )}
          />
        </PermissionProvider>
      </TermsCaptionContainer>
      {terms?.length ? (
        <PermissionProvider permissions={[Permission.DATA_ENTITY_DELETE_TERM]}>
          <Box sx={{ mx: -0.5, my: 0 }}>
            {terms
              .slice(0, visibleLimit)
              .sort()
              .map(term => (
                <TermItem key={term.id} term={term} dataEntityId={dataEntityId} />
              ))}
            {terms?.length > visibleLimit && (
              <>
                <Collapse in={viewAll} timeout='auto' unmountOnExit>
                  {viewAll &&
                    terms
                      ?.slice(visibleLimit)
                      .sort()
                      .map(term => (
                        <TermItem key={term.id} term={term} dataEntityId={dataEntityId} />
                      ))}
                </Collapse>
                <AppButton
                  size='small'
                  color='tertiary'
                  sx={{ display: 'flex', ml: 0.5, mt: 1.25 }}
                  onClick={() => setViewAll(!viewAll)}
                >
                  {viewAll ? 'Hide' : `View All (${terms?.length})`}
                </AppButton>
              </>
            )}
          </Box>
        </PermissionProvider>
      ) : (
        <Grid
          item
          xs={12}
          container
          alignItems='center'
          justifyContent='flex-start'
          wrap='nowrap'
        >
          <Typography variant='subtitle2'>Not created.</Typography>
          <PermissionProvider permissions={[Permission.DATA_ENTITY_ADD_TERM]}>
            <WithPermissions
              resourceId={dataEntityId}
              renderContent={({ isAllowedTo: addTerms }) => (
                <AddTermsForm
                  dataEntityId={dataEntityId}
                  btnCreateEl={
                    <AppButton size='small' color='tertiary' disabled={!addTerms}>
                      Add terms
                    </AppButton>
                  }
                />
              )}
            />
          </PermissionProvider>
        </Grid>
      )}
    </div>
  );
};

export default OverviewTerms;
