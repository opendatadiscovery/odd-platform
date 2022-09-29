import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getTagCreatingStatuses,
  getTagDeletingStatuses,
  getTagsList,
  getTagListFetchingStatuses,
  getTagsListPage,
} from 'redux/selectors';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { fetchTagsList } from 'redux/thunks';
import { AddIcon, ClearIcon, SearchIcon } from 'components/shared/Icons';
import {
  AppButton,
  AppInput,
  EmptyContentPlaceholder,
  NumberFormatted,
} from 'components/shared';
import { usePermissions } from 'lib/hooks';
import TagsSkeletonItem from './TagsSkeletonItem/TagsSkeletonItem';
import EditableTagItem from './EditableTagItem/EditableTagItem';
import TagCreateForm from './TagCreateForm/TagCreateForm';
import * as S from './TagsListStyles';

const TagsListView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});

  const { isLoading: isTagCreating } = useAppSelector(getTagCreatingStatuses);

  const { isLoading: isTagDeleting } = useAppSelector(getTagDeletingStatuses);

  const { isLoading: isTagsFetching } = useAppSelector(getTagListFetchingStatuses);

  const tagsList = useAppSelector(getTagsList);
  const pageInfo = useAppSelector(getTagsListPage);

  const pageSize = 100;
  const [searchText, setSearchText] = React.useState<string>('');
  const [totalTags, setTotalTags] = React.useState<number | undefined>(pageInfo?.total);

  React.useEffect(() => {
    if (!searchText) dispatch(fetchTagsList({ page: 1, size: pageSize }));
  }, [fetchTagsList, isTagCreating, isTagDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalTags(pageInfo?.total);
  }, [pageInfo]);

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    dispatch(
      fetchTagsList({
        page: pageInfo.page + 1,
        size: pageSize,
        query: searchText,
      })
    );
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchTagsList({ page: 1, size: pageSize, query: searchText }));
    }, 500),
    [searchText]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    handleSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant='h1'>Tags</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalTags} /> tags overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppInput
          placeholder='Search tag...'
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
        <TagCreateForm
          btnCreateEl={
            <AppButton
              size='medium'
              color='primaryLight'
              startIcon={<AddIcon />}
              disabled={!isAdmin}
            >
              Create tag
            </AppButton>
          }
        />
      </S.Caption>
      <S.TableHeader container>
        <S.Col item>
          <Typography variant='subtitle2' color='texts.hint'>
            Name
          </Typography>
        </S.Col>
        <S.Col item>
          <Typography variant='subtitle2' color='texts.hint'>
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
            scrollThreshold='200px'
            loader={isTagsFetching && <TagsSkeletonItem length={5} />}
          >
            {tagsList?.map(tag => (
              <EditableTagItem key={tag.id} tag={tag} />
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isTagsFetching && !tagsList.length ? <EmptyContentPlaceholder /> : null}
    </Grid>
  );
};

export default TagsListView;
