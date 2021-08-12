import React from 'react';
import {
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
} from '@material-ui/core';
import {
  Owner,
  OwnerApiDeleteOwnerRequest,
  OwnerApiGetOwnerListRequest,
} from 'generated-sources';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce/lib';
import { CurrentPageInfo } from 'redux/interfaces/common';
import AppButton from 'components/shared/AppButton/AppButton';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
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

  const handleOwnerDelete = (ownerId: number) => deleteOwner({ ownerId });

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
                <IconButton disableRipple onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: searchText && (
              <InputAdornment position="start">
                <AppButton
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
              onClick={() => {}}
              icon={<AddIcon />}
            >
              Create Owner
            </AppButton>
          }
        />
      </div>
      <>
        <Grid container className={classes.tableHeader}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" className={classes.rowName}>
              Name
            </Typography>
          </Grid>
        </Grid>
        <div id="owners-list" className={classes.listContainer}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            dataLength={ownersList.length}
            scrollThreshold="200px"
            scrollableTarget="owners-list"
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
              <Grid
                container
                className={classes.tableRow}
                key={owner.id}
                wrap="nowrap"
                alignItems="center"
                justify="space-between"
              >
                <Grid item>
                  <Typography variant="body1">{owner.name}</Typography>
                </Grid>
                <Grid item className={classes.rowActions}>
                  <OwnerFormContainer
                    owner={owner}
                    btnCreateEl={
                      <AppButton
                        color="primaryLight"
                        size="medium"
                        onClick={() => {}}
                        icon={<EditIcon />}
                      >
                        Edit
                      </AppButton>
                    }
                  />
                  <ConfirmationDialog
                    actionTitle="Are you sure you want to delete this owner?"
                    actionName="Delete Owner"
                    actionText={
                      <>
                        &quot;{owner.name}&quot; will be deleted
                        permanently.
                      </>
                    }
                    onConfirm={() => handleOwnerDelete(owner.id)}
                    actionBtn={
                      <AppButton
                        color="primaryLight"
                        size="medium"
                        onClick={() => {}}
                        icon={<DeleteIcon />}
                      >
                        Delete
                      </AppButton>
                    }
                  />
                </Grid>
              </Grid>
            ))}
          </InfiniteScroll>
        </div>
      </>
      {!isFetching && !ownersList.length ? (
        <Typography variant="subtitle1">
          {searchText ? 'No owners found' : 'No owners yet...'}
        </Typography>
      ) : null}
    </div>
  );
};

export default OwnersListView;
