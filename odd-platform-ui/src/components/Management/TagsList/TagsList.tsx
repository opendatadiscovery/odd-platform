import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Tag,
  TagApiDeleteTagRequest,
  TagApiGetPopularTagListRequest,
} from 'generated-sources';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { CurrentPageInfo } from 'redux/interfaces/common';
import AddIcon from 'components/shared/Icons/AddIcon';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import TagsSkeletonItem from './TagsSkeletonItem/TagsSkeletonItem';
import EditableTagItem from './EditableTagItem/EditableTagItem';
import TagCreateFormContainer from './TagCreateForm/TagCreateFormContainer';
import * as S from './TagsListStyles';

interface TagsListProps {
  tagsList: Tag[];
  isFetching: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  fetchTagsList: (params: TagApiGetPopularTagListRequest) => void;
  deleteTag: (params: TagApiDeleteTagRequest) => Promise<void>;
  pageInfo?: CurrentPageInfo;
}

const TagsListView: React.FC<TagsListProps> = ({
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
    <Grid container flexDirection="column" alignItems="center">
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant="h1">Tags</Typography>
        <Typography variant="subtitle1" color="texts.info">
          <NumberFormatted value={totalTags} /> tags overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppTextField
          placeholder="Search tag..."
          value={searchText}
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
            showAdornment: !!searchText,
            onCLick: () => setSearchText(''),
            icon: <ClearIcon />,
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
      </S.Caption>
      <S.TableHeader container>
        <S.Col item>
          <Typography variant="subtitle2" color="texts.hint">
            Name
          </Typography>
        </S.Col>
        <S.Col item>
          <Typography variant="subtitle2" color="texts.hint">
            Priority
          </Typography>
        </S.Col>
      </S.TableHeader>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
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
    </Grid>
  );
};

export default TagsListView;
