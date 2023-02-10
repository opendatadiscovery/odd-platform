import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { ClearIcon, SearchIcon } from 'components/shared/Icons';
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
  type AppTabItem,
  AppTabs,
  EmptyContentPlaceholder,
  NumberFormatted,
} from 'components/shared';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { type OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import ManagementSkeletonItem from '../ManagementSkeletonItem/ManagementSkeletonItem';
import ActiveAssociationRequest from './AssociationRequestItem/ActiveAssociationRequest';
import ResolvedAssociationRequest from './AssociationRequestItem/ResolvedAssociationRequest';
import * as S from './OwnerAssociationsStyles';

const OwnerAssociations: React.FC = () => {
  const dispatch = useAppDispatch();
  const { viewType } = useAppParams();
  const { managementOwnerAssociationsPath, ManagementRoutesEnum } = useAppPaths();

  const size = 30;
  const [query, setQuery] = React.useState('');
  const active = React.useMemo(() => viewType === 'New', [viewType]);

  const newRequestsPageInfo = useAppSelector(getNewOwnerAssociationRequestsPageInfo);
  const resolvedRequestsPageInfo = useAppSelector(
    getResolvedOwnerAssociationRequestsPageInfo
  );
  const newRequestsList = useAppSelector(getNewAssociationRequestsList);
  const resolvedRequestsList = useAppSelector(getResolvedAssociationRequestsList);

  const { isLoading: isRequestsListFetching, isLoaded: isRequestsListFetched } =
    useAppSelector(getOwnerAssociationRequestsListFetchingStatuses);

  const pageInfo = React.useMemo(
    () => (active ? newRequestsPageInfo : resolvedRequestsPageInfo),
    [active, newRequestsPageInfo, resolvedRequestsPageInfo]
  );

  const requestList = React.useMemo(
    () => (active ? newRequestsList : resolvedRequestsList),
    [active, newRequestsList, resolvedRequestsList]
  );

  const requestCountOverall = React.useMemo(
    () => newRequestsPageInfo.total + resolvedRequestsPageInfo.total,
    [newRequestsPageInfo, resolvedRequestsPageInfo]
  );

  const [tabs, setTabs] = React.useState<AppTabItem<boolean>[]>([]);

  React.useEffect(() => {
    setTabs([
      {
        name: 'New',
        hint: newRequestsPageInfo.total,
        link: managementOwnerAssociationsPath(ManagementRoutesEnum.associationsNew),
        value: true,
      },
      {
        name: 'Resolved',
        link: managementOwnerAssociationsPath(ManagementRoutesEnum.associationsResolved),
        value: false,
      },
    ]);
  }, [newRequestsPageInfo.total]);

  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    const tabIdx = viewType ? tabs.findIndex(tab => tab.name === viewType) : 0;
    setSelectedTab(tabIdx);
  }, [tabs, viewType]);

  const dispatchedFetchRequestsList = (
    params: OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest
  ) => dispatch(fetchOwnerAssociationRequestList(params));

  const onTabChange = () => {
    setQuery('');
    dispatchedFetchRequestsList({ page: 1, size, active: !active });
  };

  React.useEffect(() => {
    if (!query) {
      dispatchedFetchRequestsList({ page: 1, size, active });
      dispatchedFetchRequestsList({ page: 1, size, active: false });
    }
  }, [query]);

  React.useEffect(() => {
    if (
      isRequestsListFetched &&
      newRequestsPageInfo.hasNext &&
      newRequestsList.length < size
    ) {
      dispatchedFetchRequestsList({
        page: newRequestsPageInfo.page + 1,
        size,
        active,
      });
    }
  }, [newRequestsPageInfo.page, newRequestsPageInfo.hasNext, newRequestsList.length]);

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    handleSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const tableCellText = (text: string) => (
    <Typography variant='subtitle2' color='texts.hint'>
      {text}
    </Typography>
  );

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant='h1'>Owner associations</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={requestCountOverall} /> requests overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppInput
          placeholder='Search requests...'
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
          type='primary'
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
              {tableCellText('User name')}
            </Grid>
            <Grid item lg={3}>
              {tableCellText('Owner name')}
            </Grid>
            <Grid item lg={3}>
              {tableCellText('Provider')}
            </Grid>
            <Grid item lg={2} />
          </>
        ) : (
          <>
            <Grid item lg={3}>
              {tableCellText('User name')}
            </Grid>
            <Grid item lg={2}>
              {tableCellText('Owner name')}
            </Grid>
            <Grid item lg={2}>
              {tableCellText('Provider')}
            </Grid>
            <Grid item lg={2}>
              {tableCellText('Resolved by')}
            </Grid>
            <Grid item lg={1}>
              {tableCellText('Status')}
            </Grid>
            <Grid item lg={2}>
              {tableCellText('Resolved at')}
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
            scrollThreshold='200px'
            loader={isRequestsListFetching && <ManagementSkeletonItem />}
          >
            {requestList?.map(request =>
              active ? (
                <ActiveAssociationRequest
                  key={request.id}
                  id={request.id}
                  ownerName={request.ownerName}
                  provider={request.provider}
                  username={request.username}
                />
              ) : (
                <ResolvedAssociationRequest
                  key={request.id}
                  ownerName={request.ownerName}
                  provider={request.provider}
                  username={request.username}
                  status={request.status}
                  statusUpdatedAt={request.statusUpdatedAt}
                  statusUpdatedBy={request.statusUpdatedBy}
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
