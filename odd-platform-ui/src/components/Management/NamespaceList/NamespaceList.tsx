import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { AddIcon } from 'components/shared/icons';
import {
  Button,
  EmptyContentPlaceholder,
  Input,
  NumberFormatted,
  SkeletonWrapper,
} from 'components/shared/elements';
import { Grid, Typography } from '@mui/material';
import {
  getNamespaceCreatingStatuses,
  getNamespaceDeletingStatuses,
  getNamespaceList,
  getNamespaceListFetchingStatuses,
  getNamespaceListPageInfo,
} from 'redux/selectors';
import { fetchNamespaceList } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import EditableNamespaceItem from './EditableNamespaceItem/EditableNamespaceItem';
import NamespaceForm from './NamespaceForm/NamespaceForm';
import NamespaceSkeletonItem from './NamespaceListSkeleton/NamespaceListSkeleton';
import * as S from './NamespaceListStyles';

const NamespaceList: React.FC = () => {
  const dispatch = useAppDispatch();

  const namespacesList = useAppSelector(getNamespaceList);
  const pageInfo = useAppSelector(getNamespaceListPageInfo);

  const { isLoading: isNamespaceFetching } = useAppSelector(
    getNamespaceListFetchingStatuses
  );
  const { isLoading: isNamespaceCreating } = useAppSelector(getNamespaceCreatingStatuses);
  const { isLoading: isNamespaceDeleting } = useAppSelector(getNamespaceDeletingStatuses);

  const pageSize = 100;
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalNamespaces, setTotalNamespaces] = React.useState<number | undefined>(
    pageInfo?.total
  );

  React.useEffect(() => {
    if (!searchText) dispatch(fetchNamespaceList({ page: 1, size: pageSize }));
  }, [
    fetchNamespaceList,
    dispatch,
    isNamespaceCreating,
    isNamespaceDeleting,
    pageSize,
    searchText,
  ]);

  React.useEffect(() => {
    if (!searchText) setTotalNamespaces(pageInfo?.total);
  }, [pageInfo]);

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    dispatch(
      fetchNamespaceList({
        page: pageInfo.page + 1,
        size: pageSize,
        query: searchText,
      })
    );
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchNamespaceList({ page: 1, size: pageSize, query: searchText }));
    }, 500),
    [searchText]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    handleSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant='h1'>Namespaces</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalNamespaces} /> namespaces overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <Input
          variant='search-m'
          maxWidth={320}
          placeholder='Search namespace...'
          value={searchText}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
        <WithPermissions permissionTo={Permission.NAMESPACE_CREATE}>
          <NamespaceForm
            btnEl={
              <Button
                text='Create namespace'
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </S.Caption>
      <S.TableHeader container>
        <Grid item xs={12}>
          <Typography variant='subtitle2' color='texts.hint'>
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
            scrollThreshold='200px'
            loader={
              isNamespaceFetching && (
                <SkeletonWrapper
                  length={5}
                  renderContent={({ randWidth, key }) => (
                    <NamespaceSkeletonItem key={key} width={randWidth()} />
                  )}
                />
              )
            }
          >
            {namespacesList?.map(namespace => (
              <EditableNamespaceItem key={namespace.id} namespace={namespace} />
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isNamespaceFetching && !namespacesList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default NamespaceList;
