import React from 'react';
import { Box, Grid, SelectChangeEvent, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import {
  fetchDataSetStructure,
  fetchDataSetStructureLatest,
} from 'redux/thunks';
import {
  getDatasetStats,
  getDatasetStructure,
  getDataSetStructureFetchingStatus,
  getDataSetStructureLatestFetchingStatus,
  getDatasetStructureTypeStats,
  getDatasetVersionId,
  getDatasetVersions,
} from 'redux/selectors';
import { ClearIcon, ColumnsIcon } from 'components/shared/Icons';
import {
  AppInput,
  AppSelect,
  NumberFormatted,
  SkeletonWrapper,
} from 'components/shared';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useDebouncedCallback } from 'use-debounce';
import DatasetStructureSkeleton from './DatasetStructureSkeleton/DatasetStructureSkeleton';
import DatasetStructureTypeCountLabelList from './DatasetStructureTypeCountLabelList/DatasetStructureTypeCountLabelList';
import DatasetStructureTable from './DatasetStructureTable/DatasetStructureTable';

const DatasetStructure: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { dataEntityId, versionId } = useAppParams();
  const { datasetStructurePath } = useAppPaths();

  const [searchText, setSearchText] = React.useState<string>('');
  const [indexToScroll, setIndexToScroll] = React.useState(-1);

  const datasetStructureRoot = useAppSelector(
    getDatasetStructure({ datasetId: dataEntityId, versionId })
  );

  const { isLoading: isDatasetStructureFetching } = useAppSelector(
    getDataSetStructureFetchingStatus
  );
  const { isLoading: isDatasetStructureLatestFetching } = useAppSelector(
    getDataSetStructureLatestFetchingStatus
  );
  const datasetStats = useAppSelector(getDatasetStats(dataEntityId));
  const datasetVersions = useAppSelector(getDatasetVersions(dataEntityId));
  const datasetStructureVersion = useAppSelector(
    getDatasetVersionId({ datasetId: dataEntityId, versionId })
  );
  const typesCount = useAppSelector(
    getDatasetStructureTypeStats({ datasetId: dataEntityId, versionId })
  );

  React.useEffect(() => {
    if (versionId) {
      dispatch(
        fetchDataSetStructure({
          dataEntityId,
          versionId,
        })
      );
    } else {
      dispatch(fetchDataSetStructureLatest({ dataEntityId }));
    }
  }, [fetchDataSetStructureLatest, dataEntityId]);

  const handleRevisionChange = (event: SelectChangeEvent<unknown>) => {
    const newVersionId = event.target.value as unknown as number;
    dispatch(
      fetchDataSetStructure({
        dataEntityId,
        versionId: newVersionId,
      })
    );
    history.push(datasetStructurePath(dataEntityId, newVersionId));
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      const indexItem = datasetStructureRoot.findIndex(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setIndexToScroll(indexItem);
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

  const clearSearchField = () => {
    setSearchText('');
    setIndexToScroll(-1);
  };

  const [labelsListOpened, setLabelsListOpened] = React.useState(false);

  return (
    <Box sx={{ mt: 2 }}>
      {isDatasetStructureFetching || isDatasetStructureLatestFetching ? (
        <SkeletonWrapper
          renderContent={({ randWidth }) => (
            <DatasetStructureSkeleton width={randWidth()} />
          )}
        />
      ) : (
        <Grid container>
          <Grid
            item
            xs={12}
            justifyContent="space-between"
            alignItems={labelsListOpened ? 'flex-start' : 'center'}
            container
            flexWrap="nowrap"
          >
            <Grid item xs={0.8}>
              <Typography variant="h5" sx={{ display: 'flex' }}>
                <ColumnsIcon />
                <NumberFormatted
                  sx={{ mx: 0.5 }}
                  value={datasetStats?.fieldsCount}
                />
                <Typography variant="body2" color="texts.hint">
                  columns
                </Typography>
              </Typography>
            </Grid>
            <Grid item xs={7.7} container flexWrap="nowrap">
              <DatasetStructureTypeCountLabelList
                fieldsCount={datasetStats.fieldsCount}
                typesCount={typesCount}
                onListOpening={setLabelsListOpened}
              />
            </Grid>
            <Grid
              item
              xs={3.5}
              container
              flexWrap="nowrap"
              alignItems="center"
              justifyContent="flex-end"
            >
              <AppInput
                placeholder="Search"
                sx={{ minWidth: '250px', mr: 1 }}
                fullWidth={false}
                value={searchText}
                InputProps={{ 'aria-label': 'search' }}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                customEndAdornment={{
                  variant: 'clear',
                  showAdornment: !!searchText,
                  onCLick: clearSearchField,
                  icon: <ClearIcon />,
                }}
              />
              {datasetStructureVersion ? (
                <>
                  <Typography variant="subtitle2">
                    Current Revision:
                  </Typography>
                  <AppSelect
                    sx={{ width: 52, ml: 1 }}
                    fullWidth={false}
                    type="number"
                    native
                    defaultValue={datasetStructureVersion}
                    onChange={handleRevisionChange}
                  >
                    {datasetVersions?.map(rev => (
                      <option key={rev.id} value={rev.id}>
                        {rev.version}
                      </option>
                    ))}
                  </AppSelect>
                </>
              ) : null}
            </Grid>
          </Grid>
          {datasetStructureVersion ? (
            <DatasetStructureTable
              datasetStructureRoot={datasetStructureRoot}
              dataEntityId={dataEntityId}
              versionId={versionId}
              indexToScroll={indexToScroll}
            />
          ) : null}
        </Grid>
      )}
    </Box>
  );
};
export default DatasetStructure;
