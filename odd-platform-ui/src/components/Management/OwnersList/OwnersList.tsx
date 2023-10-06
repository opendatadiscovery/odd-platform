import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { AddIcon } from 'components/shared/icons';
import {
  Button,
  EmptyContentPlaceholder,
  Input,
  NumberFormatted,
  ScrollableContainer,
} from 'components/shared/elements';
import { fetchOwnersList } from 'redux/thunks';
import {
  getOwnerCreatingStatuses,
  getOwnerDeletingStatuses,
  getOwnerListFetchingStatuses,
  getOwnersList,
  getOwnersListPageInfo,
} from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import EditableOwnerItem from './EditableOwnerItem/EditableOwnerItem';
import OwnersSkeletonItem from './OwnersSkeletonItem/OwnersSkeletonItem';
import OwnerForm from './OwnerForm/OwnerForm';

const OwnersList = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const ownersList = useAppSelector(getOwnersList);
  const { total, hasNext, page } = useAppSelector(getOwnersListPageInfo);

  const { isLoading: isOwnerListFetching } = useAppSelector(getOwnerListFetchingStatuses);
  const { isLoading: isOwnerCreating } = useAppSelector(getOwnerCreatingStatuses);
  const { isLoading: isOwnerDeleting } = useAppSelector(getOwnerDeletingStatuses);

  const size = 100;
  const [query, setQuery] = useState('');
  const [totalOwners, setTotalOwners] = useState(total);

  useEffect(() => {
    if (!query) dispatch(fetchOwnersList({ page: 1, size }));
  }, [isOwnerCreating, isOwnerDeleting, query]);

  useEffect(() => {
    if (!query) setTotalOwners(total);
  }, [total, query]);

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchOwnersList({ page: page + 1, size, query }));
  };

  const handleSearch = useDebouncedCallback(() => {
    dispatch(fetchOwnersList({ page: 1, size, query }));
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
      <Grid alignItems='center' justifyContent='space-between' container sx={{ mb: 1 }}>
        <Typography variant='h1'>{t('Owners')}</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalOwners} /> {t('owners overall')}
        </Typography>
      </Grid>
      <Grid alignItems='center' justifyContent='space-between' container sx={{ mb: 2 }}>
        <Input
          variant='search-m'
          placeholder={t('Search owner')}
          maxWidth={340}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value={query}
          handleSearchClick={handleSearch}
        />
        <WithPermissions permissionTo={Permission.OWNER_CREATE}>
          <OwnerForm
            btnCreateEl={
              <Button
                text={t('Create Owner')}
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </Grid>
      <Grid sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }} container>
        <Grid px={1} item lg={4}>
          <Typography variant='subtitle2' color='texts.hint'>
            {t('Name')}
          </Typography>
        </Grid>
        <Grid px={1} item lg={6}>
          <Typography variant='subtitle2' color='texts.hint'>
            {t('Roles')}
          </Typography>
        </Grid>
        <Grid px={1} item lg={2} />
      </Grid>
      {ownersList.length > 0 && (
        <ScrollableContainer container id='owners-list'>
          <InfiniteScroll
            scrollableTarget='owners-list'
            next={fetchNextPage}
            hasMore={hasNext}
            dataLength={ownersList.length}
            scrollThreshold='200px'
            loader={<OwnersSkeletonItem length={5} />}
          >
            {ownersList?.map(({ id, name, roles }) => (
              <EditableOwnerItem key={id} ownerId={id} name={name} roles={roles} />
            ))}
          </InfiniteScroll>
        </ScrollableContainer>
      )}
      {!isOwnerListFetching && !ownersList.length ? <EmptyContentPlaceholder /> : null}
    </Grid>
  );
};

export default OwnersList;
