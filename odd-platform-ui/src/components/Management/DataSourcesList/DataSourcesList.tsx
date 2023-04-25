import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  getDatasourceDeletingStatuses,
  getDataSourcesList,
  getDataSourcesListPage,
  getIsDataSourcesListFetching,
} from 'redux/selectors';
import { fetchDataSourcesList } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useDebouncedCallback } from 'use-debounce';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AddIcon, ClearIcon, SearchIcon } from 'components/shared/icons';
import {
  AppInput,
  Button,
  EmptyContentPlaceholder,
  NumberFormatted,
} from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import DataSourceForm from './DataSourceForm/DataSourceForm';
import DataSourceSkeletonItem from './DataSourceSkeletonItem/DataSourceSkeletonItem';
import DataSourceItem from './DataSourceItem/DataSourceItem';
import * as S from './DataSourcesListStyles';

const DataSourcesListView: React.FC = () => {
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
  const [query, setQuery] = React.useState('');
  const [totalDataSources, setTotalDataSources] = React.useState(total);

  React.useEffect(() => {
    if (!query) dispatch(fetchDataSourcesList({ page: 1, size }));
  }, [isDataSourceDeleting, query]);

  React.useEffect(() => {
    if (!query) setTotalDataSources(total);
  }, [total, query]);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchDataSourcesList({ page: 1, size, query }));
    }, 500),
    [query]
  );

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
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant='h1'>Datasources</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalDataSources} /> datasources overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppInput
          placeholder='Search datasource...'
          sx={{ minWidth: '340px' }}
          fullWidth={false}
          value={query}
          customStartAdornment={{
            variant: 'search',
            showAdornment: true,
            onCLick: handleSearch,
            icon: <SearchIcon />,
          }}
          customEndAdornment={{
            variant: 'clear',
            showAdornment: !!query,
            onCLick: () => setQuery(''),
            icon: <ClearIcon />,
          }}
          InputProps={{ 'aria-label': 'search' }}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
        <WithPermissions permissionTo={Permission.DATA_SOURCE_CREATE}>
          <DataSourceForm
            btnCreateEl={
              <Button
                buttonType='secondary-m'
                startIcon={<AddIcon />}
                text='Add datasource'
              />
            }
          />
        </WithPermissions>
      </S.Caption>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={hasNext}
            loader={isDataSourcesListFetching && <DataSourceSkeletonItem length={5} />}
            dataLength={dataSourcesList.length}
          >
            {dataSourcesList.map(dataSource => (
              <Grid key={dataSource.id} sx={{ mb: 1 }}>
                <DataSourceItem key={dataSource.id} dataSource={dataSource} />
              </Grid>
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isDataSourcesListFetching && !dataSourcesList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default DataSourcesListView;
