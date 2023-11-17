import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppTabItem } from 'components/shared/elements';
import { AppTabs, Button, PageWithLeftSidebar } from 'components/shared/elements';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddIcon } from 'components/shared/icons';
import { useCreateQueryExampleSearchId } from 'lib/hooks/api/dataModelling/searchQueryExample';
import { useSearchParams } from 'react-router-dom';
import { useAppPaths, useScrollBarWidth } from 'lib/hooks';
import { useTheme } from 'styled-components';
import QueryExampleSearchInput from './QueryExampleSearchInput/QueryExampleSearchInput';
import QueryExampleSearchResults from './QueryExampleSearchResults/QueryExampleSearchResults';

const DataModelling: React.FC = () => {
  const { t } = useTranslation();
  const { DataModellingRoutes } = useAppPaths();
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollbarWidth = useScrollBarWidth();
  const theme = useTheme();

  const [searchId, setSearchId] = useState(() =>
    searchParams.get(DataModellingRoutes.querySearchId)
  );
  const [selectedTab, setSelectedTab] = useState(0);

  const { data: searchFacetsData } = useCreateQueryExampleSearchId({
    enabled: !searchId,
  });

  useEffect(() => {
    if (searchId || !searchFacetsData?.searchId) return;

    setSearchParams({ [DataModellingRoutes.querySearchId]: searchFacetsData.searchId });
    setSearchId(searchFacetsData.searchId);
  }, [searchId, searchFacetsData?.searchId]);

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Query Examples'),
        value: 'query-examples',
      },
      {
        name: t('Relationships'),
        value: 'relationships',
        disabled: true,
      },
    ],
    [t]
  );

  const handleTabChange = useCallback(() => {
    setSelectedTab(prev => (prev === 0 ? 1 : 0));
  }, []);

  return (
    <PageWithLeftSidebar.MainContainer>
      <Grid container px={2} rowSpacing={2}>
        <Grid
          item
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          xs={12}
        >
          <QueryExampleSearchInput />

          <Button
            buttonType='main-lg'
            startIcon={<AddIcon />}
            text={t('Add query example')}
          />
        </Grid>
        <Grid item xs={12}>
          <AppTabs
            type='primary'
            items={tabs}
            selectedTab={selectedTab}
            handleTabChange={handleTabChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid
            container
            borderBottom='1px solid'
            sx={{ pr: scrollbarWidth }}
            wrap='nowrap'
            borderColor={theme.palette.divider}
          >
            <Grid item xs={4} pl={theme.spacing(1)}>
              <Typography variant='caption'>{t('Definition')}</Typography>
            </Grid>
            <Grid item xs={5} pl={theme.spacing(1)}>
              <Typography variant='caption'>{t('Query')}</Typography>
            </Grid>
            <Grid item xs={3} pl={theme.spacing(1)}>
              <Typography variant='caption'>{t('Linked entities')}</Typography>
            </Grid>
          </Grid>
          {searchId ? <QueryExampleSearchResults searchId={searchId} /> : null}
        </Grid>
      </Grid>
    </PageWithLeftSidebar.MainContainer>
  );
};

export default DataModelling;
