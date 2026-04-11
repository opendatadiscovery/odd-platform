import React from 'react';
import { Button, NumberFormatted, SearchInput } from 'components/shared/elements';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddIcon } from 'components/shared/icons';
import useCreateQueryExampleSearch from 'lib/hooks/useCreateQueryExampleSearch';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import QueryExamplesList from './QueryExampleSearchResults/QueryExamplesList';
import QueryExampleForm from './QueryExampleForm/QueryExampleForm';

const QueryExamples: React.FC = () => {
  const { t } = useTranslation();
  const { facets, updateFacets, searchId, isLoading } = useCreateQueryExampleSearch();
  const handleSearch = async (query?: string) => {
    await updateFacets({ queryExampleSearchFormData: { query }, searchId });
  };

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Box display='flex' flexDirection='column' gap={1}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h1'>{t('Query Examples')}</Typography>
          <Typography variant='subtitle1' color='texts.info'>
            <NumberFormatted value={facets?.total} /> {t('query examples overall')}
          </Typography>
        </Box>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
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
        </Box>
      </Box>
      <section>
        <QueryExamplesList />
      </section>
    </Box>
  );
};

export default QueryExamples;
