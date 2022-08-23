import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { ClearIcon, SearchIcon } from 'components/shared/Icons';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import {
  getNewAssociationRequestsList,
  getNewOwnerAssociationRequestsPageInfo,
  getOwnerAssociationRequestsListFetchingStatuses,
  getResolvedAssociationRequestsList,
  getResolvedOwnerAssociationRequestsPageInfo,
} from 'redux/selectors';
import {
  AppInput,
  AppTabItem,
  AppTabs,
  EmptyContentPlaceholder,
  NumberFormatted,
} from 'components/shared';
import { useAppParams } from 'lib/hooks';
import { OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest } from 'generated-sources';
import ManagementSkeletonItem from '../ManagementSkeletonItem/ManagementSkeletonItem';
import ActiveAssociationRequest from './AssociationRequestItem/ActiveAssociationRequest';
import ResolvedAssociationRequest from './AssociationRequestItem/ResolvedAssociationRequest';
import * as S from './OwnerAssociationsStyles';

const OwnerAssociations: React.FC = () => {
  const dispatch = useAppDispatch();
  const { viewType } = useAppParams();

  const size = 30;
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(true);

  const newRequestsPageInfo = useAppSelector(
    getNewOwnerAssociationRequestsPageInfo
  );
  const resolvedRequestsPageInfo = useAppSelector(
    getResolvedOwnerAssociationRequestsPageInfo
  );
  const newRequestsList = useAppSelector(getNewAssociationRequestsList);
  const resolvedRequestsList = useAppSelector(
    getResolvedAssociationRequestsList
  );

  const { isLoading: isRequestsListFetching } = useAppSelector(
    getOwnerAssociationRequestsListFetchingStatuses
  );

  const pageInfo = React.useMemo(
    () => (active ? newRequestsPageInfo : resolvedRequestsPageInfo),
    [active, newRequestsPageInfo, resolvedRequestsPageInfo]
  );

  const requestList = React.useMemo(
    () => (active ? newRequestsList : resolvedRequestsList),
    [active, newRequestsList, resolvedRequestsList]
  );

  const requestCountOverall = React.useMemo(
    () => newRequestsList.length + resolvedRequestsList.length,
    []
  );

  const [tabs, setTabs] = React.useState<AppTabItem<boolean>[]>([]);

  React.useEffect(() => {
    setTabs([
      {
        name: 'New',
        hint: newRequestsList.length,
        value: true,
      },
      {
        name: 'Resolved',
        value: false,
      },
    ]);
  }, [newRequestsList.length]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    const tabIdx = viewType
      ? tabs.findIndex(tab => tab.name === viewType)
      : 0;
    setSelectedTab(tabIdx);
  }, [tabs, viewType]);

  const dispatchedFetchRequestsList = (
    params: OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest
  ) => dispatch(fetchOwnerAssociationRequestList(params));

  const onTabChange = () => {
    setQuery('');
    setActive(prevState => !prevState);
    dispatchedFetchRequestsList({ page: 1, size, active: !active });
  };

  React.useEffect(() => {
    if (!query) {
      dispatchedFetchRequestsList({ page: 1, size, active });
      dispatchedFetchRequestsList({ page: 1, size, active: false });
    }
  }, [query]);

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    dispatchedFetchRequestsList({
      page: pageInfo.page + 1,
      size,
      query,
      active,
    });
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatchedFetchRequestsList({ page: 1, size, query, active });
    }, 500),
    [query, active]
  );

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQuery(event.target.value);
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
        <Typography variant="h1">Owner associations</Typography>
        <Typography variant="subtitle1" color="texts.info">
          <NumberFormatted value={requestCountOverall} /> requests overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppInput
          placeholder="Search requests..."
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
      </S.Caption>
      <Grid sx={{ width: '100%' }}>
        <AppTabs
          type="primary"
          items={tabs}
          selectedTab={selectedTab}
          handleTabChange={onTabChange}
          isHintUpdating={isRequestsListFetching}
        />
      </Grid>
      <S.TableHeader container sx={{ mt: 2 }}>
        {active ? (
          <>
            <Grid item lg={4}>
              <Typography variant="subtitle2" color="texts.hint">
                User name
              </Typography>
            </Grid>
            <Grid item lg={4}>
              <Typography variant="subtitle2" color="texts.hint">
                Owner name
              </Typography>
            </Grid>
            <Grid item lg={4} />
          </>
        ) : (
          <>
            <Grid item lg={3}>
              <Typography variant="subtitle2" color="texts.hint">
                User name
              </Typography>
            </Grid>
            <Grid item lg={3}>
              <Typography variant="subtitle2" color="texts.hint">
                Owner name
              </Typography>
            </Grid>
            <Grid item lg={3}>
              <Typography variant="subtitle2" color="texts.hint">
                Resolved by
              </Typography>
            </Grid>
            <Grid item lg={1}>
              <Typography variant="subtitle2" color="texts.hint">
                Status
              </Typography>
            </Grid>
            <Grid item lg={2}>
              <Typography variant="subtitle2" color="texts.hint">
                Resolved at
              </Typography>
            </Grid>
          </>
        )}
      </S.TableHeader>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            dataLength={requestList.length}
            scrollThreshold="200px"
            loader={isRequestsListFetching && <ManagementSkeletonItem />}
          >
            {requestList?.map(request =>
              active ? (
                <ActiveAssociationRequest
                  key={request.id}
                  request={request}
                />
              ) : (
                <ResolvedAssociationRequest
                  key={request.id}
                  request={request}
                />
              )
            )}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isRequestsListFetching && !requestList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default OwnerAssociations;
