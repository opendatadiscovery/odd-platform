import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import {
  getLabelCreatingStatuses,
  getLabelDeletingStatuses,
  getLabelListFetchingStatuses,
  getLabelsList,
  getLabelsListPage,
} from 'redux/selectors';
import { fetchLabelsList } from 'redux/thunks';
import { AddIcon, SearchIcon, ClearIcon } from 'components/shared/Icons';
import {
  NumberFormatted,
  AppButton,
  AppInput,
  EmptyContentPlaceholder,
} from 'components/shared';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import LabelsSkeletonItem from './LabelsSkeletonItem/LabelsSkeletonItem';
import EditableLabelItem from './EditableLabelItem/EditableLabelItem';
import LabelCreateForm from './LabelCreateForm/LabelCreateForm';
import * as S from './LabelsListStyles';

const LabelsListView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});

  const labelsList = useAppSelector(getLabelsList);
  const pageInfo = useAppSelector(getLabelsListPage);

  const { isLoading: isLabelDeleting } = useAppSelector(getLabelDeletingStatuses);

  const { isLoading: isLabelCreating } = useAppSelector(getLabelCreatingStatuses);

  const { isLoading: isLabelFetching } = useAppSelector(getLabelListFetchingStatuses);

  const pageSize = 100;
  const [searchText, setSearchText] = React.useState('');
  const [totalLabels, setTotalLabels] = React.useState(pageInfo?.total);

  React.useEffect(() => {
    if (!searchText) dispatch(fetchLabelsList({ page: 1, size: pageSize }));
  }, [fetchLabelsList, isLabelCreating, isLabelDeleting, searchText]);

  React.useEffect(() => {
    if (!searchText) setTotalLabels(pageInfo?.total);
  }, [pageInfo]);

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    dispatch(
      fetchLabelsList({
        page: pageInfo.page + 1,
        size: pageSize,
        query: searchText,
      })
    );
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchLabelsList({ page: 1, size: pageSize, query: searchText }));
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
        <Typography variant='h1'>Labels</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={totalLabels} /> labels overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppInput
          placeholder='Search label...'
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
        <LabelCreateForm
          btnCreateEl={
            <AppButton
              size='medium'
              color='primaryLight'
              startIcon={<AddIcon />}
              disabled={!isAdmin}
            >
              Create label
            </AppButton>
          }
        />
      </S.Caption>
      <S.TableHeader container>
        <Grid item xs={12}>
          <Typography variant='subtitle2' color='texts.hint'>
            Name
          </Typography>
        </Grid>
      </S.TableHeader>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            dataLength={labelsList.length}
            scrollThreshold='200px'
            loader={isLabelFetching && <LabelsSkeletonItem length={5} />}
          >
            {labelsList?.map(label => (
              <EditableLabelItem key={label.id} label={label} />
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isLabelFetching && !labelsList.length ? <EmptyContentPlaceholder /> : null}
    </Grid>
  );
};

export default LabelsListView;
