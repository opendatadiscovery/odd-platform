import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Tag,
  TagApiDeleteTagRequest,
  TagApiGetPopularTagListRequest,
} from 'generated-sources';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce/lib';
import { CurrentPageInfo } from 'redux/interfaces/common';
import AddIcon from 'components/shared/Icons/AddIcon';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import TagsSkeletonItem from './TagsSkeletonItem/TagsSkeletonItem';
import EditableTagItem from './EditableTagItem/EditableTagItem';
import TagCreateFormContainer from './TagCreateForm/TagCreateFormContainer';
import { StylesType } from './TagsListStyles';

interface TagsListProps extends StylesType {
  tagsList: Tag[];
  isFetching: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  fetchTagsList: (params: TagApiGetPopularTagListRequest) => void;
  deleteTag: (params: TagApiDeleteTagRequest) => Promise<void>;
  pageInfo?: CurrentPageInfo;
}

const TagsListView: React.FC<TagsListProps> = ({
  classes,
  tagsList,
  isFetching,
  isDeleting,
  isCreating,
  fetchTagsList,
  deleteTag,
  pageInfo,
}) => {
  const pageSize = 100;
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalTags, setTotalTags] = React.useState<number | undefined>(
    pageInfo?.total
  );

  React.useEffect(() => {
    if (!searchText) fetchTagsList({ page: 1, size: pageSize });
  }, [fetchTagsList, isCreating, isDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalTags(pageInfo?.total);
  }, [pageInfo]);

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    fetchTagsList({
      page: pageInfo.page + 1,
      size: pageSize,
      query: searchText,
    });
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      fetchTagsList({ page: 1, size: pageSize, query: searchText });
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
        <Typography variant="h1">Tags</Typography>
        <Typography variant="subtitle1" className={classes.totalCountText}>
          <NumberFormatted value={totalTags} /> tags overall
        </Typography>
      </div>
      <div className={classes.caption}>
        <AppTextField
          placeholder="Search tag..."
          value={searchText}
          sx={{ minWidth: '340px' }}
          fullWidth={false}
          customStartAdornment={{
            variant: 'search',
            isShow: true,
            onCLick: handleSearch,
          }}
          customEndAdornment={{
            variant: 'clear',
            isShow: !!searchText,
            onCLick: () => setSearchText(''),
          }}
          InputProps={{ 'aria-label': 'search' }}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
        <TagCreateFormContainer
          btnCreateEl={
            <AppButton
              size="medium"
              color="primaryLight"
              startIcon={<AddIcon />}
            >
              Create tag
            </AppButton>
          }
        />
      </div>
      <Grid container className={classes.tagsTableHeader}>
        <Grid item className={classes.col}>
          <Typography variant="subtitle2" className={classes.rowName}>
            Name
          </Typography>
        </Grid>
        <Grid item className={classes.col}>
          <Typography variant="subtitle2" className={classes.rowName}>
            Priority
          </Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            className={classes.tagsItem}
            dataLength={tagsList.length}
            scrollThreshold="200px"
            loader={
              isFetching && (
                <SkeletonWrapper
                  length={5}
                  renderContent={({ randomSkeletonPercentWidth, key }) => (
                    <TagsSkeletonItem
                      width={randomSkeletonPercentWidth()}
                      key={key}
                    />
                  )}
                />
              )
            }
          >
            {tagsList?.map(tag => (
              <EditableTagItem
                key={tag.id}
                tag={tag}
                deleteTag={deleteTag}
              />
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isFetching && !tagsList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </div>
  );
};

export default TagsListView;
