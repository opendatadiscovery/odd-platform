import React from 'react';
import {
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
} from '@material-ui/core';
import {
  Label,
  LabelApiDeleteLabelRequest,
  LabelApiGetLabelListRequest,
} from 'generated-sources';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce/lib';
import { CurrentPageInfo } from 'redux/interfaces/common';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import AddIcon from 'components/shared/Icons/AddIcon';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import LabelsListSkeleton from 'components/Management/LabelsList/LabelsListSkeleton/LabelsListSkeleton';
import EditableLabelItem from './EditableLabelItem/EditableLabelItem';
import LabelCreateFormContainer from './LabelCreateForm/LabelCreateFormContainer';
import { StylesType } from './LabelsListStyles';

interface LabelsListProps extends StylesType {
  labelsList: Label[];
  isFetching: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  fetchLabelsList: (params: LabelApiGetLabelListRequest) => void;
  deleteLabel: (params: LabelApiDeleteLabelRequest) => Promise<void>;
  pageInfo?: CurrentPageInfo;
}

const LabelsListView: React.FC<LabelsListProps> = ({
  classes,
  labelsList,
  isFetching,
  isDeleting,
  isCreating,
  fetchLabelsList,
  deleteLabel,
  pageInfo,
}) => {
  const pageSize = 100;
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalLabels, setTotalLabels] = React.useState<number | undefined>(
    pageInfo?.total
  );

  React.useEffect(() => {
    if (!searchText) fetchLabelsList({ page: 1, size: pageSize });
  }, [fetchLabelsList, isCreating, isDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalLabels(pageInfo?.total);
  }, [pageInfo]);

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    fetchLabelsList({
      page: pageInfo.page + 1,
      size: pageSize,
      query: searchText,
    });
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      fetchLabelsList({ page: 1, size: pageSize, query: searchText });
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
        <Typography variant="h1">Labels</Typography>
        <Typography variant="subtitle1" className={classes.totalCountText}>
          <NumberFormatted value={totalLabels} /> labels overall
        </Typography>
      </div>
      <div className={classes.caption}>
        <TextField
          placeholder="Search label..."
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
        <LabelCreateFormContainer
          btnCreateEl={
            <AppButton
              size="medium"
              color="primaryLight"
              icon={<AddIcon />}
            >
              Create label
            </AppButton>
          }
        />
      </div>
      <Grid container className={classes.labelsTableHeader}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" className={classes.rowName}>
            Name
          </Typography>
        </Grid>
      </Grid>
      {labelsList.length ? (
        <div id="labels-list" className={classes.listContainer}>
          {labelsList?.length ? (
            <InfiniteScroll
              next={fetchNextPage}
              hasMore={!!pageInfo?.hasNext}
              className={classes.labelsItem}
              dataLength={labelsList.length}
              scrollThreshold="200px"
              scrollableTarget="labels-list"
              loader={
                isFetching ? <LabelsListSkeleton length={5} /> : null
              }
            >
              {labelsList?.map(label => (
                <EditableLabelItem
                  key={label.id}
                  label={label}
                  deleteLabel={deleteLabel}
                />
              ))}
            </InfiniteScroll>
          ) : null}
        </div>
      ) : null}
      {!isFetching && !labelsList.length ? (
        <Typography variant="subtitle1">
          {searchText ? 'No labels found' : 'No labels yet...'}
        </Typography>
      ) : null}
    </div>
  );
};

export default LabelsListView;
