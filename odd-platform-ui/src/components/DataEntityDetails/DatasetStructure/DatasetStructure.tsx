import React from 'react';
import { Box, Grid, SelectChangeEvent, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import round from 'lodash/round';
import toPairs from 'lodash/toPairs';
import {
  fetchDataSetStructure,
  fetchDataSetStructureLatest,
} from 'redux/thunks';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import {
  getDatasetStats,
  getDatasetStructure,
  getDataSetStructureFetchingStatus,
  getDataSetStructureLatestFetchingStatus,
  getDatasetStructureTypeStats,
  getDatasetVersionId,
  getDatasetVersions,
} from 'redux/selectors';
import { DataSetFieldTypeTypeEnum } from 'generated-sources';
import AppInput from 'components/shared/AppInput/AppInput';
import { isComplexField } from 'lib/helpers';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import ColumnsIcon from 'components/shared/Icons/ColumnsIcon';
import DatasetStructureSkeleton from 'components/DataEntityDetails/DatasetStructure/DatasetStructureSkeleton/DatasetStructureSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import AppSelect from 'components/shared/AppSelect/AppSelect';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { useDebouncedCallback } from 'use-debounce';
import DatasetStructureTable from './DatasetStructureTable/DatasetStructureTable';
import DatasetStructureFieldTypeLabel from './DatasetStructureFieldTypeLabel/DatasetStructureFieldTypeLabel';

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

  return (
    <Box sx={{ mt: 2 }}>
      {isDatasetStructureFetching || isDatasetStructureLatestFetching ? (
        <SkeletonWrapper
          renderContent={({ randomSkeletonPercentWidth }) => (
            <DatasetStructureSkeleton
              width={randomSkeletonPercentWidth()}
            />
          )}
        />
      ) : (
        <Grid container>
          <Grid
            item
            xs={12}
            justifyContent="space-between"
            alignItems="center"
            container
          >
            <Grid item xs={8} container alignItems="center" rowGap={0.5}>
              <Typography variant="h5" sx={{ mr: 3, display: 'flex' }}>
                <ColumnsIcon />
                <NumberFormatted
                  sx={{ mx: 0.5 }}
                  value={datasetStats?.fieldsCount}
                />
                <Typography variant="body2" color="texts.hint">
                  columns
                </Typography>
              </Typography>
              {toPairs(typesCount).map(([type, count]) =>
                isComplexField(type as DataSetFieldTypeTypeEnum) ? null : (
                  <Typography
                    key={type}
                    variant="h5"
                    sx={{ mr: 5, display: 'flex', alignItems: 'center' }}
                  >
                    {count}
                    <DatasetStructureFieldTypeLabel
                      sx={{ mx: 0.5 }}
                      typeName={type as DataSetFieldTypeTypeEnum}
                    />
                    <Typography
                      component="span"
                      variant="body2"
                      color="texts.hint"
                    >
                      {count && datasetStats?.fieldsCount
                        ? round(
                            (count * 100) / datasetStats.fieldsCount,
                            2
                          )
                        : 0}
                      %
                    </Typography>
                  </Typography>
                )
              )}
            </Grid>
            <Grid
              item
              xs={4}
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
