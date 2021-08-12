import React from 'react';
import {
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  DataSource,
  DataSourceApiGetDataSourceListRequest,
} from 'generated-sources';
import { useDebouncedCallback } from 'use-debounce/lib';
import { CurrentPageInfo } from 'redux/interfaces/common';
import InfiniteScroll from 'react-infinite-scroll-component';
import AppButton from 'components/shared/AppButton/AppButton';
import AddIcon from 'components/shared/Icons/AddIcon';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import DataSourceSkeletonItem from './DataSourceSkeletonItem/DataSourceSkeletonItem';
import DataSourceItemContainer from './DataSourceItem/DataSourceItemContainer';
import { StylesType } from './DataSourcesListStyles';
import DataSourceFormDialogContainer from './DataSourceFormDialog/DataSourceFormDialogContainer';

interface DataSourcesListProps extends StylesType {
  dataSourcesList: DataSource[];
  fetchDataSourcesList: (
    params: DataSourceApiGetDataSourceListRequest
  ) => void;
  isCreating: boolean;
  isDeleting: boolean;
  pageInfo?: CurrentPageInfo;
  isDataSourcesListFetching: boolean;
}

const DataSourcesListView: React.FC<DataSourcesListProps> = ({
  classes,
  dataSourcesList,
  fetchDataSourcesList,
  isCreating,
  isDeleting,
  pageInfo,
  isDataSourcesListFetching,
}) => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalDataSources, setTotalDataSources] = React.useState<
    number | undefined
  >(pageInfo?.total);

  React.useEffect(() => {
    if (!searchText) fetchDataSourcesList({ page: 1, size: 30 });
  }, [fetchDataSourcesList, isCreating, isDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalDataSources(pageInfo?.total);
  }, [pageInfo]);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      fetchDataSourcesList({ page: 1, size: 30, query: searchText });
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
      size: 30,
      query: searchText,
    });
  };

  return (
    <div className={classes.container}>
      <div className={classes.caption}>
        <Typography variant="h1">Datasources</Typography>
        <Typography variant="subtitle1" className={classes.totalCountText}>
          <NumberFormatted value={totalDataSources} /> datasources
        </Typography>
      </div>
      <div className={classes.caption}>
        <TextField
          placeholder="Search datasource..."
          classes={{ root: classes.searchInput }}
          value={searchText}
          InputProps={{
            'aria-label': 'search',
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="end">
                <IconButton disableRipple onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: searchText && (
              <InputAdornment position="start">
                <AppButton
                  size="small"
                  color="unfilled"
                  icon={<CancelIcon />}
                  onClick={() => setSearchText('')}
                />
              </InputAdornment>
            ),
          }}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
        <DataSourceFormDialogContainer
          btnCreateEl={
            <AppButton
              size="medium"
              color="primaryLight"
              icon={<AddIcon />}
            >
              Add datasource
            </AppButton>
          }
        />
      </div>
      <div className={classes.datasourcesListContainer}>
        <InfiniteScroll
          next={fetchNextPage}
          hasMore={!!pageInfo?.hasNext}
          loader={
            isDataSourcesListFetching ? (
              <SkeletonWrapper
                length={5}
                renderContent={({ randomSkeletonPercentWidth, key }) => (
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
            <DataSourceItemContainer
              classes={{ container: classes.datasourceItem }}
              key={dataSource.id}
              dataSource={dataSource}
            />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default DataSourcesListView;
