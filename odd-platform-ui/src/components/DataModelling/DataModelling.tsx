import React, { useCallback, useMemo, useState } from 'react';
import type { AppTabItem } from 'components/shared/elements';
import { AppTabs, Button, PageWithLeftSidebar } from 'components/shared/elements';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddIcon } from 'components/shared/icons';
import {
  useCreateQueryExampleSearchId,
  useSearchQueryExamples,
} from 'lib/hooks/api/dataModelling/searchQueryExample';
import InfiniteScroll from 'react-infinite-scroll-component';
import QueryExampleSearchInput from './QueryExampleSearchInput/QueryExampleSearchInput';
import QueryExampleSearchResultsSkeleton from './QueryExampleSearchResultsSkeleton/QueryExampleSearchResultsSkeleton';

const DataModelling: React.FC = () => {
  const { t } = useTranslation();
  const { data: searchFacetsData } = useCreateQueryExampleSearchId();
  const searchId = searchFacetsData?.searchId;

  const [selectedTab, setSelectedTab] = useState(0);

  const { data, hasNextPage, fetchNextPage } = useSearchQueryExamples({
    searchId: searchId ?? '',
    size: 5,
    enabled: !!searchId,
  });

  const queryExamples = data?.pages.flatMap(page => page.items) ?? [];

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
        <Grid item xs={12} id='query-example-items-list' height={90} overflow='scroll'>
          {queryExamples.length > 0 && (
            <InfiniteScroll
              scrollableTarget='query-example-items-list'
              dataLength={queryExamples.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              scrollThreshold='90px'
              loader={<QueryExampleSearchResultsSkeleton length={5} />}
            >
              {queryExamples.map(queryExample => (
                <div key={queryExample.definition}>{queryExample.definition}</div>
              ))}
            </InfiniteScroll>
          )}
        </Grid>
      </Grid>
    </PageWithLeftSidebar.MainContainer>
  );
};

export default DataModelling;
