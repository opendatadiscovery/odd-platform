import React from 'react';
import { Box } from '@mui/material';
import { fetchDataSetStructure, fetchDataSetStructureLatest } from 'redux/thunks';
import {
  getDatasetStats,
  getDatasetStructure,
  getDataSetStructureFetchingError,
  getDataSetStructureFetchingStatus,
  getDataSetStructureLatestFetchingError,
  getDataSetStructureLatestFetchingStatus,
  getDatasetStructureTypeStats,
  getDatasetVersionId,
  getDatasetVersions,
} from 'redux/selectors';
import { AppErrorPage, EmptyContentPlaceholder } from 'components/shared';
import { useAppParams } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import DatasetStructureSkeleton from './DatasetStructureSkeleton/DatasetStructureSkeleton';
import DatasetStructureView from './DatasetStructureView/DatasetStructureView';

const DatasetStructure: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId, versionId } = useAppParams();

  const {
    isLoaded: isDatasetStructureFetched,
    isLoading: isDatasetStructureFetching,
    isNotLoaded: isDatasetStructureNotFetched,
  } = useAppSelector(getDataSetStructureFetchingStatus);
  const {
    isLoaded: isDatasetStructureLatestFetched,
    isLoading: isDatasetStructureLatestFetching,
    isNotLoaded: isDatasetStructureLatestNotFetched,
  } = useAppSelector(getDataSetStructureLatestFetchingStatus);

  const datasetStructureFetchingError = useAppSelector(getDataSetStructureFetchingError);
  const datasetStructureLatestFetchingError = useAppSelector(
    getDataSetStructureLatestFetchingError
  );

  const datasetStats = useAppSelector(getDatasetStats(dataEntityId));
  const datasetVersions = useAppSelector(getDatasetVersions(dataEntityId));
  const datasetStructureVersion = useAppSelector(
    getDatasetVersionId({ datasetId: dataEntityId, versionId })
  );
  const datasetStructureRoot = useAppSelector(
    getDatasetStructure({ datasetId: dataEntityId, versionId })
  );
  const typesCount = useAppSelector(
    getDatasetStructureTypeStats({ datasetId: dataEntityId, versionId })
  );

  React.useEffect(() => {
    if (versionId) {
      dispatch(fetchDataSetStructure({ dataEntityId, versionId }));
    } else {
      dispatch(fetchDataSetStructureLatest({ dataEntityId }));
    }
  }, []);

  return (
    <Box sx={{ mt: 1 }}>
      <DatasetStructureSkeleton
        showSkeleton={isDatasetStructureFetching || isDatasetStructureLatestFetching}
      />
      <DatasetStructureView
        showStructure={
          !!datasetStructureVersion &&
          datasetStructureRoot.length > 0 &&
          !(isDatasetStructureFetching || isDatasetStructureLatestFetching)
        }
        fieldsCount={datasetStats.fieldsCount}
        typesCount={typesCount}
        datasetVersions={datasetVersions}
        datasetStructureVersion={datasetStructureVersion}
        datasetStructureRoot={datasetStructureRoot}
        dataEntityId={dataEntityId}
        versionId={versionId}
        datasetRowsCount={datasetStats.rowsCount}
      />
      <AppErrorPage
        showError={isDatasetStructureNotFetched || isDatasetStructureLatestNotFetched}
        error={datasetStructureFetchingError || datasetStructureLatestFetchingError}
        offsetTop={132}
      />
      <EmptyContentPlaceholder
        isContentLoaded={
          (isDatasetStructureFetched || isDatasetStructureLatestFetched) &&
          !(isDatasetStructureFetching || isDatasetStructureLatestFetching) &&
          !(isDatasetStructureNotFetched || isDatasetStructureLatestNotFetched)
        }
        isContentEmpty={!datasetStructureRoot.length}
      />
    </Box>
  );
};
export default DatasetStructure;
