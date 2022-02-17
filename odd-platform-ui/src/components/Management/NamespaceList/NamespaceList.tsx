import React from 'react';
import {
  Namespace,
  NamespaceApiDeleteNamespaceRequest,
  NamespaceApiGetNamespaceListRequest,
} from 'generated-sources';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { CurrentPageInfo } from 'redux/interfaces/common';
import AddIcon from 'components/shared/Icons/AddIcon';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import { Grid, Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import EditableNamespaceItem from './EditableNamespaceItem/EditableNamespaceItem';
import NamespaceFormContainer from './NamespaceForm/NamespaceFormContainer';
import NamespaceSkeletonItem from './NamespaceListSkeleton/NamespaceListSkeleton';
import * as S from './NamespaceListStyles';

interface NamespaceListProps {
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
    <Grid container flexDirection="column" alignItems="center">
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant="h1">Namespaces</Typography>
        <Typography variant="subtitle1" color="texts.info">
          <NumberFormatted value={totalNamespaces} /> namespaces overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
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
      </S.Caption>
      <S.TableHeader container>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="texts.hint">
            Name
          </Typography>
        </Grid>
      </S.TableHeader>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            dataLength={namespacesList.length}
            scrollThreshold="200px"
            loader={
              isFetching ? (
                <SkeletonWrapper
                  length={5}
                  renderContent={({ randomSkeletonPercentWidth, key }) => (
                    <NamespaceSkeletonItem
                      key={key}
                      width={randomSkeletonPercentWidth()}
                    />
                  )}
                />
              ) : null
            }
          >
            {namespacesList?.map(namespace => (
              <EditableNamespaceItem
                key={namespace.id}
                namespace={namespace}
                deleteNamespace={deleteNamespace}
              />
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isFetching && !namespacesList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default NamespaceListView;
