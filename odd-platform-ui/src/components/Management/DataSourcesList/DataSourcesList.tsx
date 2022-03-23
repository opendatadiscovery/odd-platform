import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  DataSource,
  DataSourceApiGetDataSourceListRequest,
} from 'generated-sources';
import { useDebouncedCallback } from 'use-debounce';
import { CurrentPageInfo } from 'redux/interfaces/common';
import InfiniteScroll from 'react-infinite-scroll-component';
import AddIcon from 'components/shared/Icons/AddIcon';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import DataSourceFormDialogContainer from 'components/Management/DataSourcesList/DataSourceForm/DataSourceFormContainer';
import DataSourceSkeletonItem from './DataSourceSkeletonItem/DataSourceSkeletonItem';
import DataSourceItemContainer from './DataSourceItem/DataSourceItemContainer';
import * as S from './DataSourcesListStyles';

interface DataSourcesListProps {
  dataSourcesList: DataSource[];
  fetchDataSourcesList: (
    params: DataSourceApiGetDataSourceListRequest
  ) => void;
  isDeleting: boolean;
  pageInfo?: CurrentPageInfo;
  isDataSourcesListFetching: boolean;
}

const DataSourcesListView: React.FC<DataSourcesListProps> = ({
  dataSourcesList,
  fetchDataSourcesList,
  isDeleting,
  pageInfo,
  isDataSourcesListFetching,
}) => {
  const pageSize = 30;
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalDataSources, setTotalDataSources] = React.useState<
    number | undefined
  >(pageInfo?.total);

  React.useEffect(() => {
    if (!searchText) {
      fetchDataSourcesList({ page: 1, size: pageSize });
    }
  }, [isDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalDataSources(pageInfo?.total);
  }, [pageInfo]);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      fetchDataSourcesList({ page: 1, size: pageSize, query: searchText });
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
    fetchDataSourcesList({
      page: pageInfo.page + 1,
      size: pageSize,
      query: searchText,
    });
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
        <AppTextField
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
        <DataSourceFormDialogContainer
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
              renderContent={({ randomSkeletonPercentWidth, key }) => (
                <DataSourceSkeletonItem
                  width={randomSkeletonPercentWidth()}
                  key={key}
                />
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
                    renderContent={({
                      randomSkeletonPercentWidth,
                      key,
                    }) => (
                      <DataSourceSkeletonItem
                        width={randomSkeletonPercentWidth()}
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
                  <DataSourceItemContainer
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
