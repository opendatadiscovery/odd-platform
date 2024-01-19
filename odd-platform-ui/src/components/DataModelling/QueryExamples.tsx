import React from 'react';
import { Button, SearchInput } from 'components/shared/elements';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddIcon } from 'components/shared/icons';
import useCreateQueryExampleSearch from 'lib/hooks/useCreateQueryExampleSearch';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import QueryExamplesList from './QueryExampleSearchResults/QueryExamplesList';
import DataModellingTabs from './DataModellingTabs';
import QueryExampleForm from './QueryExampleForm/QueryExampleForm';

const QueryExamples: React.FC = () => {
  const { t } = useTranslation();
  const { facets, updateFacets, searchId, isLoading } = useCreateQueryExampleSearch();
  const handleSearch = async (query?: string) => {
    await updateFacets({ queryExampleSearchFormData: { query }, searchId });
  };

  return (
    <Grid container gap={2}>
      <Grid
        item
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        xs={12}
      >
        <SearchInput
          id='query-examples-search'
          placeholder='Search query examples'
          value={facets?.query}
          isLoading={isLoading}
          onSearch={handleSearch}
        />
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
        <QueryExamplesList />
      </Grid>
    </Grid>
  );
};

export default QueryExamples;
