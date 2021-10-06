import React from 'react';
import {
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  Owner,
  OwnerApiDeleteOwnerRequest,
  OwnerApiGetOwnerListRequest,
} from 'generated-sources';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce/lib';
import { CurrentPageInfo } from 'redux/interfaces/common';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import EditableOwnerItem from 'components/Management/OwnersList/EditableOwnerItem/EditableOwnerItem';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppButton from 'components/shared/AppButton/AppButton';
import OwnersSkeletonItem from './OwnersSkeletonItem/OwnersSkeletonItem';
import OwnerFormContainer from './OwnerForm/OwnerFormContainer';
import { StylesType } from './OwnersListStyles';

interface OwnersListProps extends StylesType {
  ownersList: Owner[];
  isFetching: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  fetchOwnersList: (params: OwnerApiGetOwnerListRequest) => void;
  deleteOwner: (params: OwnerApiDeleteOwnerRequest) => Promise<void>;
  pageInfo?: CurrentPageInfo;
}

const OwnersListView: React.FC<OwnersListProps> = ({
  classes,
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
    <div className={classes.container}>
      <div className={classes.caption}>
        <Typography variant="h1">Owners</Typography>
        <Typography variant="subtitle1" className={classes.totalCountText}>
          <NumberFormatted value={totalOwners} /> owners overall
        </Typography>
      </div>
      <div className={classes.caption}>
        <TextField
          placeholder="Search owner..."
          classes={{ root: classes.searchInput }}
          value={searchText}
          InputProps={{
            'aria-label': 'search',
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="end">
                <AppIconButton
                  size="small"
                  color="unfilled"
                  icon={<SearchIcon />}
                  onClick={handleSearch}
                />
              </InputAdornment>
            ),
            endAdornment: searchText && (
              <InputAdornment position="start">
                <AppIconButton
                  size="small"
                  color="unfilled"
                  icon={<CancelIcon />}
                  onClick={() => setSearchText('')}
                />
              </InputAdornment>
            ),
          }}
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
      </div>
      <Grid container className={classes.tableHeader}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" className={classes.rowName}>
            Name
          </Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            dataLength={ownersList.length}
            className={classes.ownersItem}
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
    </div>
  );
};

export default OwnersListView;
