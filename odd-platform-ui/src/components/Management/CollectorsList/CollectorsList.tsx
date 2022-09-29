import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  getCollectorsListPage,
  getCollectorsList,
  getCollectorDeletingStatuses,
  getCollectorsListFetchingStatuses,
} from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { fetchCollectorsList } from 'redux/thunks';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AddIcon, SearchIcon, ClearIcon } from 'components/shared/Icons';
import {
  NumberFormatted,
  AppButton,
  AppInput,
  EmptyContentPlaceholder,
} from 'components/shared';
import { usePermissions } from 'lib/hooks';
import CollectorForm from './CollectorForm/CollectorForm';
import CollectorSkeletonItem from './CollectorSkeletonItem/CollectorSkeletonItem';
import CollectorItem from './CollectorItem/CollectorItem';
import { CollectorCaption } from './CollectorsListStyles';

const CollectorsListView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});

  const pageInfo = useAppSelector(getCollectorsListPage);
  const collectorsList = useAppSelector(getCollectorsList);

  const { isLoading: isCollectorDeleting } = useAppSelector(
    getCollectorDeletingStatuses
  );
  const { isLoading: isCollectorsListFetching } = useAppSelector(
    getCollectorsListFetchingStatuses
  );

  const pageSize = 30;
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalCollectors, setTotalCollectors] = React.useState<
    number | undefined
  >(pageInfo?.total);

  React.useEffect(() => {
    if (!searchText) {
      dispatch(fetchCollectorsList({ page: 1, size: pageSize }));
    }
  }, [isCollectorDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalCollectors(pageInfo?.total);
  }, [pageInfo]);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(
        fetchCollectorsList({ page: 1, size: pageSize, query: searchText })
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
      fetchCollectorsList({
        page: pageInfo.page + 1,
        size: pageSize,
        query: searchText,
      })
    );
  };

  return (
    <Grid container flexDirection="column" alignItems="center">
      <CollectorCaption container sx={{ mb: 1 }}>
        <Typography variant="h1">Collectors</Typography>
        <Typography variant="subtitle1" color="texts.info">
          <NumberFormatted value={totalCollectors} /> collectors overall
        </Typography>
      </CollectorCaption>
      <CollectorCaption container sx={{ mb: 2 }}>
        <AppInput
          placeholder="Search collector..."
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
        <CollectorForm
          btnCreateEl={
            <AppButton
              size="medium"
              color="primaryLight"
              startIcon={<AddIcon />}
              disabled={!isAdmin}
            >
              Add collector
            </AppButton>
          }
        />
      </CollectorCaption>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            dataLength={collectorsList.length}
            loader={
              isCollectorsListFetching && (
                <CollectorSkeletonItem length={5} />
              )
            }
          >
            {collectorsList.map(collector => (
              <Grid key={collector.id} sx={{ mb: 1 }}>
                <CollectorItem key={collector.id} collector={collector} />
              </Grid>
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isCollectorsListFetching && !collectorsList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default CollectorsListView;
