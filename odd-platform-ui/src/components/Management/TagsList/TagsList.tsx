import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getTagCreatingStatuses,
  getTagDeletingStatuses,
  getTagListFetchingStatuses,
  getTagsList,
  getTagsListPage,
} from 'redux/selectors';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { fetchTagsList } from 'redux/thunks';
import { AddIcon, ClearIcon, SearchIcon } from 'components/shared/icons';
import {
  Button,
  AppInput,
  EmptyContentPlaceholder,
  NumberFormatted,
} from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import TagsSkeletonItem from './TagsSkeletonItem/TagsSkeletonItem';
import EditableTagItem from './EditableTagItem/EditableTagItem';
import TagCreateForm from './TagCreateForm/TagCreateForm';
import * as S from './TagsListStyles';

const TagsListView: React.FC = () => {
  const dispatch = useAppDispatch();

  const { isLoading: isTagCreating } = useAppSelector(getTagCreatingStatuses);
  const { isLoading: isTagDeleting } = useAppSelector(getTagDeletingStatuses);
  const { isLoading: isTagsFetching } = useAppSelector(getTagListFetchingStatuses);

  const tagsList = useAppSelector(getTagsList);
  const { page, total, hasNext } = useAppSelector(getTagsListPage);

  const size = 100;
  const [query, setQuery] = React.useState('');
  const [totalTags, setTotalTags] = React.useState(total);

  React.useEffect(() => {
    if (!query) dispatch(fetchTagsList({ page: 1, size }));
  }, [fetchTagsList, isTagCreating, isTagDeleting, query]);

  React.useEffect(() => {
    if (!query) setTotalTags(total);
  }, [total]);

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchTagsList({ page: page + 1, size, query }));
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchTagsList({ page: 1, size, query }));
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
        <Typography variant='h1'>Tags</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalTags} /> tags overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppInput
          placeholder='Search tag...'
          value={query}
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
            showAdornment: !!query,
            onCLick: () => setQuery(''),
            icon: <ClearIcon />,
          }}
          InputProps={{ 'aria-label': 'search' }}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
        <WithPermissions permissionTo={Permission.TAG_CREATE}>
          <TagCreateForm
            btnCreateEl={
              <Button
                text='Create tag'
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
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
            hasMore={hasNext}
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
      {!isTagsFetching && !tagsList.length ? (
        <EmptyContentPlaceholder offsetTop={190} />
      ) : null}
    </Grid>
  );
};

export default TagsListView;
