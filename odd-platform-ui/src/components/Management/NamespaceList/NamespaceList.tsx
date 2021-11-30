import React from 'react';
import {
  Namespace,
  NamespaceApiDeleteNamespaceRequest,
  NamespaceApiGetNamespaceListRequest,
} from 'generated-sources';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce/lib';
import { CurrentPageInfo } from 'redux/interfaces/common';
import AddIcon from 'components/shared/Icons/AddIcon';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import { Grid, Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import EditableNamespaceItem from './EditableNamespaceItem/EditableNamespaceItem';
import NamespaceFormContainer from './NamespaceForm/NamespaceFormContainer';
import NamespaceListSkeleton from './NamespaceListSkeleton/NamespaceListSkeleton';
import { StylesType } from './NamespaceListStyles';

interface NamespaceListProps extends StylesType {
  namespacesList: Namespace[];
  isFetching: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  fetchNamespaceList: (
    params: NamespaceApiGetNamespaceListRequest
  ) => void;
  deleteNamespace: (
    params: NamespaceApiDeleteNamespaceRequest
  ) => Promise<void>;
  pageInfo?: CurrentPageInfo;
}

const NamespaceListView: React.FC<NamespaceListProps> = ({
  classes,
  namespacesList,
  isFetching,
  isDeleting,
  isCreating,
  fetchNamespaceList,
  deleteNamespace,
  pageInfo,
}) => {
  const pageSize = 100;
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalNamespaces, setTotalNamespaces] = React.useState<
    number | undefined
  >(pageInfo?.total);

  React.useEffect(() => {
    if (!searchText) fetchNamespaceList({ page: 1, size: pageSize });
  }, [fetchNamespaceList, isCreating, isDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalNamespaces(pageInfo?.total);
  }, [pageInfo]);

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    fetchNamespaceList({
      page: pageInfo.page + 1,
      size: pageSize,
      query: searchText,
    });
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      fetchNamespaceList({ page: 1, size: pageSize, query: searchText });
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

  return (
    <div className={classes.container}>
      <div className={classes.caption}>
        <Typography variant="h1">Namespaces</Typography>
        <Typography variant="subtitle1" className={classes.totalCountText}>
          <NumberFormatted value={totalNamespaces} /> namespaces overall
        </Typography>
      </div>
      <div className={classes.caption}>
        <AppTextField
          placeholder="Search namespace..."
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
        <NamespaceFormContainer
          btnEl={
            <AppButton
              size="medium"
              color="primaryLight"
              startIcon={<AddIcon />}
            >
              Create namespace
            </AppButton>
          }
        />
      </div>
      <Grid container className={classes.namespacesTableHeader}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" className={classes.rowName}>
            Name
          </Typography>
        </Grid>
      </Grid>
      <div id="namespaces-list" className={classes.listContainer}>
        <InfiniteScroll
          next={fetchNextPage}
          hasMore={!!pageInfo?.hasNext}
          className={classes.namespacesItem}
          dataLength={namespacesList.length}
          scrollThreshold="200px"
          scrollableTarget="namespaces-list"
          loader={isFetching ? <NamespaceListSkeleton length={5} /> : null}
        >
          {namespacesList?.map(namespace => (
            <EditableNamespaceItem
              key={namespace.id}
              namespace={namespace}
              deleteNamespace={deleteNamespace}
            />
          ))}
        </InfiniteScroll>
      </div>
      {!isFetching && !namespacesList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </div>
  );
};

export default NamespaceListView;
