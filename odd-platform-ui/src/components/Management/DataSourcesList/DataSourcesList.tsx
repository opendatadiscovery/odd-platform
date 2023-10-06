import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { useDebouncedCallback } from 'use-debounce';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import {
  getDatasourceDeletingStatuses,
  getDataSourcesList,
  getDataSourcesListPage,
  getIsDataSourcesListFetching,
} from 'redux/selectors';
import { fetchDataSourcesList } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { AddIcon } from 'components/shared/icons';
import {
  Button,
  EmptyContentPlaceholder,
  Input,
  NumberFormatted,
  ScrollableContainer,
} from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import DataSourceForm from './DataSourceForm/DataSourceForm';
import DataSourceSkeletonItem from './DataSourceSkeletonItem/DataSourceSkeletonItem';
import DataSourceItem from './DataSourceItem/DataSourceItem';

const DataSourcesListView = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const dataSourcesList = useAppSelector(getDataSourcesList);
  const { page, total, hasNext } = useAppSelector(getDataSourcesListPage);

  const { isLoading: isDataSourcesListFetching } = useAppSelector(
    getIsDataSourcesListFetching
  );
  const { isLoading: isDataSourceDeleting } = useAppSelector(
    getDatasourceDeletingStatuses
  );

  const size = 30;
  const [query, setQuery] = useState('');
  const [totalDataSources, setTotalDataSources] = useState(total);

  useEffect(() => {
    if (!query) dispatch(fetchDataSourcesList({ page: 1, size }));
  }, [isDataSourceDeleting, query]);

  useEffect(() => {
    if (!query) setTotalDataSources(total);
  }, [total, query]);

  const handleSearch = useDebouncedCallback(() => {
    dispatch(fetchDataSourcesList({ page: 1, size, query }));
  }, 500);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    handleSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSearch();
  };

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchDataSourcesList({ page: page + 1, size, query }));
  };

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <Grid alignItems='center' justifyContent='space-between' container sx={{ mb: 1 }}>
        <Typography variant='h1'>{t('Datasources')}</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalDataSources} /> {t('datasources overall')}
        </Typography>
      </Grid>
      <Grid alignItems='center' justifyContent='space-between' container sx={{ mb: 2 }}>
        <Input
          variant='search-m'
          placeholder={t('Search datasource')}
          maxWidth={340}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value={query}
          handleSearchClick={handleSearch}
        />
        <WithPermissions permissionTo={Permission.DATA_SOURCE_CREATE}>
          <DataSourceForm
            btnCreateEl={
              <Button
                buttonType='secondary-m'
                startIcon={<AddIcon />}
                text={t('Add datasource')}
              />
            }
          />
        </WithPermissions>
      </Grid>
      {dataSourcesList.length > 0 && (
        <ScrollableContainer container id='datasources-list'>
          <InfiniteScroll
            scrollableTarget='datasources-list'
            next={fetchNextPage}
            hasMore={hasNext}
            loader={<DataSourceSkeletonItem length={5} />}
            dataLength={dataSourcesList.length}
          >
            {dataSourcesList.map(dataSource => (
              <Grid key={dataSource.id} sx={{ mb: 1 }}>
                <DataSourceItem key={dataSource.id} dataSource={dataSource} />
              </Grid>
            ))}
          </InfiniteScroll>
        </ScrollableContainer>
      )}
      {!isDataSourcesListFetching && !dataSourcesList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default DataSourcesListView;
