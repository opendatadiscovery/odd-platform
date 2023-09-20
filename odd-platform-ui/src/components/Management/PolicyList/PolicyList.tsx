import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getPoliciesFetchingStatuses,
  getPoliciesList,
  getPoliciesListPageInfo,
} from 'redux/selectors';
import { fetchPolicyList } from 'redux/thunks';
import { AddIcon } from 'components/shared/icons';
import {
  Button,
  EmptyContentPlaceholder,
  Input,
  NumberFormatted,
} from 'components/shared/elements';
import { useAppPaths } from 'lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import PolicyItem from './PolicyItem/PolicyItem';
import * as S from './PolicyListStyles';
import PolicyListSkeleton from './PolicyListSkeleton/PolicyListSkeleton';

const PolicyList: React.FC = () => {
  const { t } = useTranslation();
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
        <Typography variant='h1'>{t('Policies')}</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalPolicies} /> {t('policies overall')}
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <Input
          variant='search-m'
          placeholder={t('Search policies')}
          maxWidth={340}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value={query}
          handleSearchClick={handleSearch}
        />
        <WithPermissions permissionTo={Permission.POLICY_CREATE}>
          <Button
            text={t('Create policy')}
            to={ManagementRoutes.createPolicy}
            buttonType='secondary-m'
            startIcon={<AddIcon />}
          />
        </WithPermissions>
      </S.Caption>
      <S.TableHeader container flexWrap='nowrap'>
        <Grid item lg={3.53}>
          <Typography variant='subtitle2' color='texts.hint'>
            {t('Policy name')}
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
