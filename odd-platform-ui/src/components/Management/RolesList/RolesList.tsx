import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getRolesFetchingStatuses,
  getRolesList,
  getRolesPageInfo,
} from 'redux/selectors';
import { fetchRolesList } from 'redux/thunks';
import { AddIcon } from 'components/shared/icons';
import {
  Button,
  EmptyContentPlaceholder,
  Input,
  NumberFormatted,
} from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import RoleForm from './RoleForm/RoleForm';
import RoleItem from './RoleItem/RoleItem';
import * as S from './RolesListStyles';
import RoleSkeletonItem from './RoleSkeletonItem/RoleSkeletonItem';

const RolesList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { isLoading: isRolesFetching } = useAppSelector(getRolesFetchingStatuses);

  const rolesList = useAppSelector(getRolesList);
  const { page, hasNext, total } = useAppSelector(getRolesPageInfo);

  const size = 100;
  const [query, setQuery] = React.useState('');
  const [totalRoles, setTotalRoles] = React.useState(total);

  React.useEffect(() => {
    if (!query) dispatch(fetchRolesList({ page: 1, size }));
  }, [fetchRolesList, query]);

  React.useEffect(() => {
    if (!query) setTotalRoles(total);
  }, [total]);

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchRolesList({ page: page + 1, size, query }));
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchRolesList({ page: 1, size, query }));
    }, 500),
    [query, size, fetchRolesList]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    handleSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSearch();
  };

  const contentNotExists = React.useMemo(
    () => !isRolesFetching && !rolesList.length,
    [isRolesFetching, rolesList.length]
  );

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant='h1'>{t('Roles')}</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalRoles} /> {t('roles overall')}
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <Input
          variant='search-m'
          placeholder={t('Search roles')}
          maxWidth={340}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value={query}
          handleSearchClick={handleSearch}
        />
        <WithPermissions permissionTo={Permission.ROLE_CREATE}>
          <RoleForm
            openBtn={
              <Button
                text={t('Create role')}
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </S.Caption>
      <S.TableHeader container flexWrap='nowrap'>
        <Grid item lg={3.53}>
          <Typography variant='subtitle2' color='texts.hint'>
            {t('Role name')}
          </Typography>
        </Grid>
        <Grid item lg={6.73}>
          <Typography variant='subtitle2' color='texts.hint'>
            {t('Policy')}
          </Typography>
        </Grid>
        <Grid item lg={1.74} />
      </S.TableHeader>
      <S.ScrollContainer $isContentExists={!contentNotExists} id='roles-list'>
        <InfiniteScroll
          next={fetchNextPage}
          hasMore={hasNext}
          dataLength={rolesList.length}
          scrollThreshold='200px'
          scrollableTarget='roles-list'
          loader={isRolesFetching && <RoleSkeletonItem length={5} />}
        >
          {rolesList.map(({ id, name, policies }) => (
            <RoleItem key={id} roleId={id} name={name} policies={policies} />
          ))}
        </InfiniteScroll>
      </S.ScrollContainer>
      {contentNotExists ? <EmptyContentPlaceholder /> : null}
    </Grid>
  );
};

export default RolesList;
