import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Collector,
  CollectorApiGetCollectorsListRequest,
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
import CollectorFormDialogContainer from 'components/Management/CollectorsList/CollectorForm/CollectorFormContainer';
import CollectorSkeletonItem from './CollectorSkeletonItem/CollectorSkeletonItem';
import CollectorItemContainer from './CollectorItem/CollectorItemContainer';
import { CollectorCaption } from './CollectorsListStyles';

interface CollectorsListProps {
  collectorsList: Collector[];
  fetchCollectorsList: (
    params: CollectorApiGetCollectorsListRequest
  ) => void;
  isDeleting: boolean;
  pageInfo?: CurrentPageInfo;
  isCollectorsListFetching: boolean;
}

const CollectorsListView: React.FC<CollectorsListProps> = ({
  collectorsList,
  fetchCollectorsList,
  isDeleting,
  pageInfo,
  isCollectorsListFetching,
}) => {
  const pageSize = 30;
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalCollectors, setTotalCollectors] = React.useState<
    number | undefined
  >(pageInfo?.total);

  React.useEffect(() => {
    if (!searchText) {
      fetchCollectorsList({ page: 1, size: pageSize });
    }
  }, [isDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalCollectors(pageInfo?.total);
  }, [pageInfo]);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      fetchCollectorsList({ page: 1, size: pageSize, query: searchText });
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
    fetchCollectorsList({
      page: pageInfo.page + 1,
      size: pageSize,
      query: searchText,
    });
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
        <AppTextField
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
        <CollectorFormDialogContainer
          btnCreateEl={
            <AppButton
              size="medium"
              color="primaryLight"
              startIcon={<AddIcon />}
            >
              Add collector
            </AppButton>
          }
        />
      </CollectorCaption>
      <Grid container>
        <Grid item xs={12}>
          {isCollectorsListFetching ? (
            <SkeletonWrapper
              length={5}
              renderContent={({ randomSkeletonPercentWidth, key }) => (
                <CollectorSkeletonItem
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
                isCollectorsListFetching ? (
                  <SkeletonWrapper
                    length={5}
                    renderContent={({
                      randomSkeletonPercentWidth,
                      key,
                    }) => (
                      <CollectorSkeletonItem
                        width={randomSkeletonPercentWidth()}
                        key={key}
                      />
                    )}
                  />
                ) : null
              }
              dataLength={collectorsList.length}
            >
              {collectorsList.map(collector => (
                <Grid key={collector.id} sx={{ mb: 1 }}>
                  <CollectorItemContainer
                    key={collector.id}
                    collector={collector}
                  />
                </Grid>
              ))}
            </InfiniteScroll>
          )}
        </Grid>
      </Grid>
      {!isCollectorsListFetching && !collectorsList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default CollectorsListView;
