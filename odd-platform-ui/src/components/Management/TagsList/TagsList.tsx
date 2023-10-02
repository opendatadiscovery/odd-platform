import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getTagCreatingStatuses,
  getTagDeletingStatuses,
  getTagListFetchingStatuses,
  getTagsList,
  getTagsListPage,
} from 'redux/selectors';
import { fetchTagsList } from 'redux/thunks';
import { AddIcon } from 'components/shared/icons';
import {
  Button,
  EmptyContentPlaceholder,
  Input,
  NumberFormatted,
  ScrollableContainer,
} from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import TagsSkeletonItem from './TagsSkeletonItem/TagsSkeletonItem';
import EditableTagItem from './EditableTagItem/EditableTagItem';
import TagCreateForm from './TagCreateForm/TagCreateForm';

const TagsListView = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { isLoading: isTagCreating } = useAppSelector(getTagCreatingStatuses);
  const { isLoading: isTagDeleting } = useAppSelector(getTagDeletingStatuses);
  const { isLoading: isTagsFetching } = useAppSelector(getTagListFetchingStatuses);

  const tagsList = useAppSelector(getTagsList);
  const { page, total, hasNext } = useAppSelector(getTagsListPage);

  const size = 100;
  const [query, setQuery] = useState('');
  const [totalTags, setTotalTags] = useState(total);

  useEffect(() => {
    if (!query) dispatch(fetchTagsList({ page: 1, size }));
  }, [fetchTagsList, isTagCreating, isTagDeleting, query]);

  useEffect(() => {
    if (!query) setTotalTags(total);
  }, [total]);

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchTagsList({ page: page + 1, size, query }));
  };

  const handleSearch = useDebouncedCallback(() => {
    dispatch(fetchTagsList({ page: 1, size, query }));
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
        <Typography variant='h1'>{t('Tags')}</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalTags} /> {t('tags overall')}
        </Typography>
      </Grid>
      <Grid alignItems='center' justifyContent='space-between' container sx={{ mb: 2 }}>
        <Input
          variant='search-m'
          placeholder={t('Search tag')}
          maxWidth={340}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value={query}
          handleSearchClick={handleSearch}
        />
        <WithPermissions permissionTo={Permission.TAG_CREATE}>
          <TagCreateForm
            btnCreateEl={
              <Button
                text={t('Create tag')}
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </Grid>
      <Grid sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }} container>
        <Grid lg={4} pl={1} item>
          <Typography variant='subtitle2' color='texts.hint'>
            {t('Name')}
          </Typography>
        </Grid>
        <Grid lg={5} item>
          <Typography variant='subtitle2' color='texts.hint'>
            {t('Priority')}
          </Typography>
        </Grid>
        <Grid item lg={3} />
      </Grid>
      {tagsList.length > 0 && (
        <ScrollableContainer $offsetY={140} id='tags-list' sx={{ width: '100%' }}>
          <InfiniteScroll
            scrollableTarget='tags-list'
            next={fetchNextPage}
            hasMore={hasNext}
            dataLength={tagsList.length}
            loader={<TagsSkeletonItem length={5} />}
          >
            {tagsList.map(tag => (
              <EditableTagItem key={tag.id} tag={tag} />
            ))}
          </InfiniteScroll>
        </ScrollableContainer>
      )}
      {!isTagsFetching && !tagsList.length ? (
        <EmptyContentPlaceholder offsetTop={190} />
      ) : null}
    </Grid>
  );
};

export default TagsListView;
