import React from 'react';
import { Button } from 'components/shared/elements';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddIcon } from 'components/shared/icons';
import useCreateQueryExampleSearch from 'lib/hooks/useCreateQueryExampleSearch';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import QueryExampleSearchInput from './QueryExampleSearchInput/QueryExampleSearchInput';
import QueryExampleSearchResults from './QueryExampleSearchResults/QueryExampleSearchResults';
import DataModellingTabs from './DataModellingTabs';
import QueryExamplesListHeader from '../shared/elements/QueryExamples/QueryExamplesListHeader';
import QueryExampleForm from './QueryExampleForm/QueryExampleForm';

const QueryExamplesContainer: React.FC = () => {
  const { t } = useTranslation();
  const { facets, searchId } = useCreateQueryExampleSearch();

  return (
    <Grid container gap={2}>
      <Grid
        item
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        xs={12}
      >
        <QueryExampleSearchInput facets={facets} />
        <WithPermissions permissionTo={Permission.QUERY_EXAMPLE_CREATE}>
          <QueryExampleForm
            btnCreateEl={
              <Button
                buttonType='main-lg'
                startIcon={<AddIcon />}
                text={t('Add query example')}
              />
            }
          />
        </WithPermissions>
      </Grid>
      <Grid item xs={12}>
        <DataModellingTabs />
      </Grid>
      <Grid item xs={12}>
        <QueryExamplesListHeader />
        {searchId && <QueryExampleSearchResults searchId={searchId} />}
      </Grid>
    </Grid>
  );
};

export default QueryExamplesContainer;
