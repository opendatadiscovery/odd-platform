import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getPoliciesFetchingStatuses,
  getPoliciesList,
  getPoliciesListPageInfo,
} from 'redux/selectors';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { fetchPolicyList } from 'redux/thunks';
import { AddIcon, ClearIcon, SearchIcon } from 'components/shared/icons';
import {
  Button,
  AppInput,
  EmptyContentPlaceholder,
  NumberFormatted,
} from 'components/shared/elements';
import { useAppPaths } from 'lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import PolicyItem from './PolicyItem/PolicyItem';
import * as S from './PolicyListStyles';
import PolicyListSkeleton from './PolicyListSkeleton/PolicyListSkeleton';

const PolicyList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { ManagementRoutes } = useAppPaths();

  const { isLoading: isPoliciesFetching } = useAppSelector(getPoliciesFetchingStatuses);

  const policyList = useAppSelector(getPoliciesList);
  const { page, hasNext, total } = useAppSelector(getPoliciesListPageInfo);

  const size = 100;
  const [query, setQuery] = React.useState('');
  const [totalPolicies, setTotalPolicies] = React.useState(total);

  React.useEffect(() => {
    if (!query) dispatch(fetchPolicyList({ page: 1, size }));
  }, [fetchPolicyList, query]);

  React.useEffect(() => {
    if (!query) setTotalPolicies(total);
  }, [total]);

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchPolicyList({ page: page + 1, size, query }));
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchPolicyList({ page: 1, size, query }));
    }, 500),
    [query, size, fetchPolicyList]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    handleSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSearch();
  };

  const contentNotExists = React.useMemo(
    () => !isPoliciesFetching && !policyList.length,
    [isPoliciesFetching, policyList.length]
  );

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant='h1'>Policies</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalPolicies} /> policies overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppInput
          placeholder='Search policies...'
          value={query}
          sx={{ minWidth: '340px' }}
          fullWidth={false}
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
        <WithPermissions permissionTo={Permission.POLICY_CREATE}>
          <Button
            text='Create policy'
            to={ManagementRoutes.createPolicy}
            buttonType='secondary-m'
            startIcon={<AddIcon />}
          />
        </WithPermissions>
      </S.Caption>
      <S.TableHeader container flexWrap='nowrap'>
        <Grid item lg={3.53}>
          <Typography variant='subtitle2' color='texts.hint'>
            Policy name
          </Typography>
        </Grid>
        <Grid item lg={6.73} />
        <Grid item lg={1.74} />
      </S.TableHeader>
      <S.ScrollContainer $isContentExists={!contentNotExists} id='policy-list'>
        <InfiniteScroll
          next={fetchNextPage}
          hasMore={hasNext}
          dataLength={policyList.length}
          scrollThreshold='200px'
          scrollableTarget='policy-list'
          loader={isPoliciesFetching && <PolicyListSkeleton length={5} />}
        >
          {policyList?.map(({ id, name }) => (
            <PolicyItem key={id} policyId={id} name={name} />
          ))}
        </InfiniteScroll>
      </S.ScrollContainer>
      {contentNotExists ? <EmptyContentPlaceholder /> : null}
    </Grid>
  );
};

export default PolicyList;
