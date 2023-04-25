import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { AddIcon, ClearIcon, SearchIcon } from 'components/shared/icons';
import {
  Button,
  AppInput,
  EmptyContentPlaceholder,
  NumberFormatted,
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
import * as S from './OwnersListStyles';

const OwnersList: React.FC = () => {
  const dispatch = useAppDispatch();

  const ownersList = useAppSelector(getOwnersList);
  const { total, hasNext, page } = useAppSelector(getOwnersListPageInfo);

  const { isLoading: isOwnerListFetching } = useAppSelector(getOwnerListFetchingStatuses);
  const { isLoading: isOwnerCreating } = useAppSelector(getOwnerCreatingStatuses);
  const { isLoading: isOwnerDeleting } = useAppSelector(getOwnerDeletingStatuses);

  const size = 100;
  const [query, setQuery] = React.useState('');
  const [totalOwners, setTotalOwners] = React.useState(total);

  React.useEffect(() => {
    if (!query) dispatch(fetchOwnersList({ page: 1, size }));
  }, [fetchOwnersList, isOwnerCreating, isOwnerDeleting, query]);

  React.useEffect(() => {
    if (!query) setTotalOwners(total);
  }, [total]);

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchOwnersList({ page: page + 1, size, query }));
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchOwnersList({ page: 1, size, query }));
    }, 500),
    [query]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    handleSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSearch();
  };

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant='h1'>Owners</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalOwners} /> owners overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppInput
          placeholder='Search owner...'
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
        <WithPermissions permissionTo={Permission.OWNER_CREATE}>
          <OwnerForm
            btnCreateEl={
              <Button
                text='Create Owner'
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </S.Caption>
      <S.TableHeader container>
        <Grid item lg={3.53}>
          <Typography variant='subtitle2' color='texts.hint'>
            Name
          </Typography>
        </Grid>
        <Grid item lg={6.73}>
          <Typography variant='subtitle2' color='texts.hint'>
            Roles
          </Typography>
        </Grid>
        <Grid item lg={1.74} />
      </S.TableHeader>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={hasNext}
            dataLength={ownersList.length}
            scrollThreshold='200px'
            loader={isOwnerListFetching && <OwnersSkeletonItem length={5} />}
          >
            {ownersList?.map(({ id, name, roles }) => (
              <EditableOwnerItem key={id} ownerId={id} name={name} roles={roles} />
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isOwnerListFetching && !ownersList.length ? <EmptyContentPlaceholder /> : null}
    </Grid>
  );
};

export default OwnersList;
