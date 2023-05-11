import React, { useEffect } from 'react';
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
  getDatasetVersions,
} from 'redux/selectors';
import { AppErrorPage, EmptyContentPlaceholder } from 'components/shared/elements';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useNavigate } from 'react-router-dom';
import DatasetStructureOverviewProvider from './lib/DatasetStructureOverviewProvider';
import DatasetStructureSkeleton from './DatasetStructureSkeleton/DatasetStructureSkeleton';
import DatasetStructureView from './DatasetStructureView/DatasetStructureView';

const DatasetStructureOverview: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { datasetStructurePath, DataEntityRoutes } = useAppPaths();
  const { dataEntityId, versionId } = useAppParams();

  useEffect(() => {
    if (versionId) {
      dispatch(fetchDataSetStructure({ dataEntityId, versionId }));
    } else {
      dispatch(fetchDataSetStructureLatest({ dataEntityId }))
        .unwrap()
        .then(({ dataSetVersionId }) => {
          navigate(
            datasetStructurePath(
              DataEntityRoutes.overview,
              dataEntityId,
              dataSetVersionId
            ),
            { replace: true }
          );
        });
    }
  }, []);

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
  const datasetStructureRoot = useAppSelector(
    getDatasetStructure({ datasetId: dataEntityId, versionId })
  );
  const typesCount = useAppSelector(
    getDatasetStructureTypeStats({ datasetId: dataEntityId, versionId })
  );

  const showStructure = React.useMemo(
    () =>
      !!versionId &&
      datasetVersions.length > 0 &&
      datasetStructureRoot.length > 0 &&
      (isDatasetStructureFetched || isDatasetStructureLatestFetched),
    [
      versionId,
      datasetStructureRoot,
      isDatasetStructureFetching,
      isDatasetStructureLatestFetching,
    ]
  );

  return (
    <Box>
      <DatasetStructureSkeleton
        showSkeleton={isDatasetStructureFetching || isDatasetStructureLatestFetching}
      />
      {showStructure && (
        <DatasetStructureOverviewProvider
          datasetStructureRoot={datasetStructureRoot}
          datasetVersions={datasetVersions}
          initialSelectedFieldId={datasetStructureRoot?.[0].id}
          datasetFieldRowsCount={datasetStats?.rowsCount}
          datasetFieldFieldsCount={datasetStats?.fieldsCount}
          datasetFieldTypesCount={typesCount}
        >
          <DatasetStructureView />
        </DatasetStructureOverviewProvider>
      )}
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
export default DatasetStructureOverview;
