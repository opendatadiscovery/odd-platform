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
import { AddIcon, ClearIcon, SearchIcon } from 'components/shared/icons';
import {
  Button,
  AppInput,
  EmptyContentPlaceholder,
  NumberFormatted,
} from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import LabelsSkeletonItem from './LabelsSkeletonItem/LabelsSkeletonItem';
import EditableLabelItem from './EditableLabelItem/EditableLabelItem';
import LabelCreateForm from './LabelCreateForm/LabelCreateForm';
import * as S from './LabelsListStyles';

const LabelsListView: React.FC = () => {
  const dispatch = useAppDispatch();

  const labelsList = useAppSelector(getLabelsList);
  const { page, hasNext, total } = useAppSelector(getLabelsListPage);

  const { isLoading: isLabelDeleting } = useAppSelector(getLabelDeletingStatuses);
  const { isLoading: isLabelCreating } = useAppSelector(getLabelCreatingStatuses);
  const { isLoading: isLabelFetching } = useAppSelector(getLabelListFetchingStatuses);

  const size = 100;
  const [query, setQuery] = React.useState('');
  const [totalLabels, setTotalLabels] = React.useState(total);

  React.useEffect(() => {
    if (!query) dispatch(fetchLabelsList({ page: 1, size }));
  }, [fetchLabelsList, isLabelCreating, isLabelDeleting, query]);

  React.useEffect(() => {
    if (!query) setTotalLabels(total);
  }, [total]);

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchLabelsList({ page: page + 1, size, query }));
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchLabelsList({ page: 1, size, query }));
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
          value={query}
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
        <WithPermissions permissionTo={Permission.LABEL_CREATE}>
          <LabelCreateForm
            btnCreateEl={
              <Button
                text='Create label'
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
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
            hasMore={hasNext}
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
