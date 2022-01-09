import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Label,
  LabelApiDeleteLabelRequest,
  LabelApiGetLabelListRequest,
} from 'generated-sources';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce/lib';
import { CurrentPageInfo } from 'redux/interfaces/common';
import AddIcon from 'components/shared/Icons/AddIcon';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import LabelsSkeletonItem from 'components/Management/LabelsList/LabelsSkeletonItem/LabelsSkeletonItem';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import EditableLabelItem from './EditableLabelItem/EditableLabelItem';
import LabelCreateFormContainer from './LabelCreateForm/LabelCreateFormContainer';
import * as S from './LabelsListStyles';

interface LabelsListProps {
  labelsList: Label[];
  isFetching: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  fetchLabelsList: (params: LabelApiGetLabelListRequest) => void;
  deleteLabel: (params: LabelApiDeleteLabelRequest) => Promise<void>;
  pageInfo?: CurrentPageInfo;
}

const LabelsListView: React.FC<LabelsListProps> = ({
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
    <Grid container flexDirection="column" alignItems="center">
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant="h1">Labels</Typography>
        <Typography variant="subtitle1" color="texts.info">
          <NumberFormatted value={totalLabels} /> labels overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppTextField
          placeholder="Search label..."
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
        <LabelCreateFormContainer
          btnCreateEl={
            <AppButton
              size="medium"
              color="primaryLight"
              startIcon={<AddIcon />}
            >
              Create label
            </AppButton>
          }
        />
      </S.Caption>
      <S.TableHeader container>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="texts.hint">
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
            scrollThreshold="200px"
            loader={
              isFetching ? (
                <SkeletonWrapper
                  length={5}
                  renderContent={({ randomSkeletonPercentWidth, key }) => (
                    <LabelsSkeletonItem
                      key={key}
                      width={randomSkeletonPercentWidth()}
                    />
                  )}
                />
              ) : null
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
        </Grid>
      </Grid>
      {!isFetching && !labelsList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default LabelsListView;
