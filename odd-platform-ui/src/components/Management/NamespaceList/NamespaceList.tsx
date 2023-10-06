import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddIcon } from 'components/shared/icons';
import {
  Button,
  EmptyContentPlaceholder,
  Input,
  NumberFormatted,
  ScrollableContainer,
} from 'components/shared/elements';
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
import NamespaceListSkeleton from './NamespaceListSkeleton/NamespaceListSkeleton';

const NamespaceList = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const namespacesList = useAppSelector(getNamespaceList);
  const pageInfo = useAppSelector(getNamespaceListPageInfo);

  const { isLoading: isNamespaceFetching } = useAppSelector(
    getNamespaceListFetchingStatuses
  );
  const { isLoading: isNamespaceCreating } = useAppSelector(getNamespaceCreatingStatuses);
  const { isLoading: isNamespaceDeleting } = useAppSelector(getNamespaceDeletingStatuses);

  const size = 100;
  const [query, setQuery] = useState('');
  const [totalNamespaces, setTotalNamespaces] = useState(pageInfo?.total);

  useEffect(() => {
    if (!query) dispatch(fetchNamespaceList({ page: 1, size }));
  }, [isNamespaceCreating, isNamespaceDeleting, size, query]);

  useEffect(() => {
    if (!query) setTotalNamespaces(pageInfo?.total);
  }, [pageInfo?.total, query]);

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    dispatch(fetchNamespaceList({ page: pageInfo.page + 1, size, query }));
  };

  const handleSearch = useDebouncedCallback(() => {
    dispatch(fetchNamespaceList({ page: 1, size, query }));
  }, 500);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    handleSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSearch();
  };

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <Grid container sx={{ mb: 1 }} alignItems='center' justifyContent='space-between'>
        <Typography variant='h1'>{t('Namespaces')}</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalNamespaces} /> {t('namespaces overall')}
        </Typography>
      </Grid>
      <Grid container sx={{ mb: 2 }} alignItems='center' justifyContent='space-between'>
        <Input
          variant='search-m'
          maxWidth={320}
          placeholder={t('Search namespace')}
          value={query}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
        <WithPermissions permissionTo={Permission.NAMESPACE_CREATE}>
          <NamespaceForm
            btnEl={
              <Button
                text={t('Create namespace')}
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </Grid>
      <Grid container sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography px={1} variant='subtitle2' color='texts.hint'>
          {t('Name')}
        </Typography>
      </Grid>
      {namespacesList.length > 0 && (
        <ScrollableContainer container $offsetY={140} id='namespaces-list'>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            dataLength={namespacesList.length}
            scrollThreshold='200px'
            scrollableTarget='namespaces-list'
            loader={<NamespaceListSkeleton />}
          >
            {namespacesList.map(namespace => (
              <EditableNamespaceItem key={namespace.id} namespace={namespace} />
            ))}
          </InfiniteScroll>
        </ScrollableContainer>
      )}
      {!isNamespaceFetching && !namespacesList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default NamespaceList;
