import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Owner,
  OwnerApiDeleteOwnerRequest,
  OwnerApiGetOwnerListRequest,
} from 'generated-sources';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce/lib';
import { CurrentPageInfo } from 'redux/interfaces/common';
import AddIcon from 'components/shared/Icons/AddIcon';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import EditableOwnerItem from 'components/Management/OwnersList/EditableOwnerItem/EditableOwnerItem';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import OwnersSkeletonItem from './OwnersSkeletonItem/OwnersSkeletonItem';
import OwnerFormContainer from './OwnerForm/OwnerFormContainer';
import * as S from './OwnersListStyles';

interface OwnersListProps {
  ownersList: Owner[];
  isFetching: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  fetchOwnersList: (params: OwnerApiGetOwnerListRequest) => void;
  deleteOwner: (params: OwnerApiDeleteOwnerRequest) => Promise<void>;
  pageInfo?: CurrentPageInfo;
}

const OwnersListView: React.FC<OwnersListProps> = ({
  ownersList,
  isFetching,
  isDeleting,
  isCreating,
  fetchOwnersList,
  deleteOwner,
  pageInfo,
}) => {
  const pageSize = 100;
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalOwners, setTotalOwners] = React.useState<number | undefined>(
    pageInfo?.total
  );

  React.useEffect(() => {
    if (!searchText) fetchOwnersList({ page: 1, size: pageSize });
  }, [fetchOwnersList, isCreating, isDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalOwners(pageInfo?.total);
  }, [pageInfo]);

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    fetchOwnersList({
      page: pageInfo.page + 1,
      size: pageSize,
      query: searchText,
    });
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      fetchOwnersList({ page: 1, size: pageSize, query: searchText });
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

  return (
    <Grid container flexDirection="column" alignItems="center">
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant="h1">Owners</Typography>
        <Typography variant="subtitle1" color="texts.info">
          <NumberFormatted value={totalOwners} /> owners overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppTextField
          placeholder="Search owner..."
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
        <OwnerFormContainer
          btnCreateEl={
            <AppButton
              color="primaryLight"
              size="medium"
              startIcon={<AddIcon />}
            >
              Create Owner
            </AppButton>
          }
        />
      </S.Caption>
      <S.TableHeader container>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="texts.hint">
            Name
          </Typography>
        </Grid>
      </S.TableHeader>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            dataLength={ownersList.length}
            scrollThreshold="200px"
            loader={
              isFetching && (
                <SkeletonWrapper
                  length={5}
                  renderContent={({ randomSkeletonPercentWidth, key }) => (
                    <OwnersSkeletonItem
                      width={randomSkeletonPercentWidth()}
                      key={key}
                    />
                  )}
                />
              )
            }
          >
            {ownersList?.map(owner => (
              <EditableOwnerItem
                key={owner.id}
                owner={owner}
                deleteOwner={deleteOwner}
              />
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isFetching && !ownersList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default OwnersListView;
