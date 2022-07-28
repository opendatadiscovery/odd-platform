import React from 'react';
import { Box, Grid, SelectChangeEvent, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import round from 'lodash/round';
import toPairs from 'lodash/toPairs';
import { DataSetFieldTypeTypeEnum } from 'generated-sources';
import {
  fetchDataSetStructureLatest,
  fetchDataSetStructure,
} from 'redux/thunks/datasetStructure.thunks';
import {
  getDatasetStructureTypeStats,
  getDatasetVersionId,
  getDataSetStructureFetchingStatus,
  getDataSetStructureLatestFetchingStatus,
} from 'redux/selectors/datasetStructure.selectors';
import {
  getDatasetStats,
  getDatasetVersions,
} from 'redux/selectors/dataentity.selectors';
import { isComplexField } from 'lib/helpers';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import ColumnsIcon from 'components/shared/Icons/ColumnsIcon';
import DatasetStructureSkeleton from 'components/DataEntityDetails/DatasetStructure/DatasetStructureSkeleton/DatasetStructureSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import AppSelect from 'components/shared/AppSelect/AppSelect';
import { useAppPaths, useAppParams } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import DatasetStructureTable from './DatasetStructureTable/DatasetStructureTable';
import DatasetStructureFieldTypeLabel from './DatasetStructureFieldTypeLabel/DatasetStructureFieldTypeLabel';

const DatasetStructure: React.FC = () => {
  const history = useHistory();
  const { dataEntityId, versionId } = useAppParams();
  const { datasetStructurePath } = useAppPaths();
  const dispatch = useAppDispatch();

  const { isLoading: isDatasetStructureFetching } = useAppSelector(
    getDataSetStructureFetchingStatus
  );
  const { isLoading: isDatasetStructureLatestFetching } = useAppSelector(
    getDataSetStructureLatestFetchingStatus
  );
  const datasetStats = useAppSelector(state =>
    getDatasetStats(state, dataEntityId)
  );
  const datasetVersions = useAppSelector(state =>
    getDatasetVersions(state, dataEntityId)
  );
  const datasetStructureVersion = useAppSelector(state =>
    getDatasetVersionId(state, {
      datasetId: dataEntityId,
      versionId,
    })
  );
  const typesCount = useAppSelector(state =>
    getDatasetStructureTypeStats(state, {
      datasetId: dataEntityId,
      versionId,
    })
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
            <Grid item xs={8} container alignItems="center">
              <Typography variant="h5" display="flex" sx={{ mr: 3 }}>
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
                  <Typography key={type} variant="h5" sx={{ mr: 5 }}>
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
              xs={2}
              container
              flexWrap="nowrap"
              alignItems="center"
              justifyContent="flex-end"
            >
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
              dataEntityId={dataEntityId}
              versionId={versionId}
            />
          ) : null}
        </Grid>
      )}
    </Box>
  );
};
export default DatasetStructure;
