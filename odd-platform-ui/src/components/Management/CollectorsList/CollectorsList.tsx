import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  getCollectorDeletingStatuses,
  getCollectorsList,
  getCollectorsListFetchingStatuses,
  getCollectorsListPage,
} from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { fetchCollectorsList } from 'redux/thunks';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AddIcon, ClearIcon, SearchIcon } from 'components/shared/icons';
import {
  Button,
  AppInput,
  EmptyContentPlaceholder,
  NumberFormatted,
} from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import CollectorForm from './CollectorForm/CollectorForm';
import CollectorSkeletonItem from './CollectorSkeletonItem/CollectorSkeletonItem';
import CollectorItem from './CollectorItem/CollectorItem';
import { CollectorCaption } from './CollectorsListStyles';

const CollectorsListView: React.FC = () => {
  const dispatch = useAppDispatch();

  const { page, hasNext, total } = useAppSelector(getCollectorsListPage);
  const collectorsList = useAppSelector(getCollectorsList);

  const { isLoading: isCollectorDeleting } = useAppSelector(getCollectorDeletingStatuses);
  const { isLoading: isCollectorsListFetching } = useAppSelector(
    getCollectorsListFetchingStatuses
  );

  const size = 30;
  const [query, setQuery] = React.useState('');
  const [totalCollectors, setTotalCollectors] = React.useState(total);

  React.useEffect(() => {
    if (!query) dispatch(fetchCollectorsList({ page: 1, size }));
  }, [isCollectorDeleting, query, size]);

  React.useEffect(() => {
    if (!query) setTotalCollectors(total);
  }, [query, total]);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchCollectorsList({ page: 1, size, query }));
    }, 500),
    [query, size]
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
    dispatch(fetchCollectorsList({ page: page + 1, size, query }));
  };

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <CollectorCaption container sx={{ mb: 1 }}>
        <Typography variant='h1'>Collectors</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalCollectors} /> collectors overall
        </Typography>
      </CollectorCaption>
      <CollectorCaption container sx={{ mb: 2 }}>
        <AppInput
          placeholder='Search collector...'
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
        <WithPermissions permissionTo={Permission.COLLECTOR_CREATE}>
          <CollectorForm
            btnCreateEl={
              <Button
                text='Add collector'
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </CollectorCaption>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={hasNext}
            dataLength={collectorsList.length}
            loader={isCollectorsListFetching && <CollectorSkeletonItem length={5} />}
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
