import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  getDataSourcesListPage,
  getDataSourcesList,
  getDatasourceDeletingStatuses,
  getIsDataSourcesListFetching,
} from 'redux/selectors';
import { fetchDataSourcesList } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { useDebouncedCallback } from 'use-debounce';
import InfiniteScroll from 'react-infinite-scroll-component';
import AddIcon from 'components/shared/Icons/AddIcon';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import AppButton from 'components/shared/AppButton/AppButton';
import AppInput from 'components/shared/AppInput/AppInput';

import SearchIcon from 'components/shared/Icons/SearchIcon';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import DataSourceForm from 'components/Management/DataSourcesList/DataSourceForm/DataSourceForm';
import DataSourceSkeletonItem from './DataSourceSkeletonItem/DataSourceSkeletonItem';
import DataSourceItem from './DataSourceItem/DataSourceItem';
import * as S from './DataSourcesListStyles';

const DataSourcesListView: React.FC = () => {
  const dispatch = useAppDispatch();
  const dataSourcesList = useAppSelector(getDataSourcesList);

  const pageInfo = useAppSelector(getDataSourcesListPage);

  const { isLoading: isDataSourcesListFetching } = useAppSelector(
    getIsDataSourcesListFetching
  );
  const { isLoading: isDataSourceDeleting } = useAppSelector(
    getDatasourceDeletingStatuses
  );

  const pageSize = 30;
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalDataSources, setTotalDataSources] = React.useState<
    number | undefined
  >(pageInfo?.total);

  React.useEffect(() => {
    if (!searchText) {
      dispatch(fetchDataSourcesList({ page: 1, size: pageSize }));
    }
  }, [isDataSourceDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalDataSources(pageInfo?.total);
  }, [pageInfo]);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(
        fetchDataSourcesList({
          page: 1,
          size: pageSize,
          query: searchText,
        })
      );
    }, 500),
    [searchText]
  );

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchText(event.target.value);
    handleSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    dispatch(
      fetchDataSourcesList({
        page: pageInfo.page + 1,
        size: pageSize,
        query: searchText,
      })
    );
  };

  return (
    <Grid container flexDirection="column" alignItems="center">
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant="h1">Datasources</Typography>
        <Typography variant="subtitle1" color="texts.info">
          <NumberFormatted value={totalDataSources} /> datasources overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppInput
          placeholder="Search datasource..."
          sx={{ minWidth: '340px' }}
          fullWidth={false}
          value={searchText}
          customStartAdornment={{
            variant: 'search',
            showAdornment: true,
            onCLick: handleSearch,
            icon: <SearchIcon />,
          }}
          customEndAdornment={{
            variant: 'clear',
            showAdornment: !!searchText,
            onCLick: () => setSearchText(''),
            icon: <ClearIcon />,
          }}
          InputProps={{ 'aria-label': 'search' }}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
        <DataSourceForm
          btnCreateEl={
            <AppButton
              size="medium"
              color="primaryLight"
              startIcon={<AddIcon />}
            >
              Add datasource
            </AppButton>
          }
        />
      </S.Caption>
      <Grid container>
        <Grid item xs={12}>
          {isDataSourcesListFetching ? (
            <SkeletonWrapper
              length={5}
              renderContent={({ randWidth, key }) => (
                <DataSourceSkeletonItem width={randWidth()} key={key} />
              )}
            />
          ) : (
            <InfiniteScroll
              next={fetchNextPage}
              hasMore={!!pageInfo?.hasNext}
              loader={
                isDataSourcesListFetching ? (
                  <SkeletonWrapper
                    length={5}
                    renderContent={({ randWidth, key }) => (
                      <DataSourceSkeletonItem
                        width={randWidth()}
                        key={key}
                      />
                    )}
                  />
                ) : null
              }
              dataLength={dataSourcesList.length}
            >
              {dataSourcesList.map(dataSource => (
                <Grid key={dataSource.id} sx={{ mb: 1 }}>
                  <DataSourceItem
                    key={dataSource.id}
                    dataSource={dataSource}
                  />
                </Grid>
              ))}
            </InfiniteScroll>
          )}
        </Grid>
      </Grid>
      {!isDataSourcesListFetching && !dataSourcesList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default DataSourcesListView;
