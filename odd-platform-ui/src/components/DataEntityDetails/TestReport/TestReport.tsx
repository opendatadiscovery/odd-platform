import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  DataSetApiGetDataSetStructureByVersionIdRequest,
  DataSetApiGetDataSetStructureLatestRequest,
  DataSetStats,
  DataSetVersion,
} from 'generated-sources';
import { datasetStructurePath } from 'lib/paths';
import { DataSetStructureTypesCount } from 'redux/interfaces/datasetStructure';
import { StylesType } from './TestReportStyles';

interface DatasetStructureTableProps extends StylesType {
  dataEntityId: number;
  datasetStats: DataSetStats;
  datasetVersions?: DataSetVersion[];
  typesCount: DataSetStructureTypesCount;
  versionIdParam?: number;
  datasetStructureVersion?: number;
  fetchDataSetStructureLatest: (
    params: DataSetApiGetDataSetStructureLatestRequest
  ) => void;
  fetchDataSetStructure: (
    params: DataSetApiGetDataSetStructureByVersionIdRequest
  ) => void;
}

const TestReport: React.FC<DatasetStructureTableProps> = ({
  classes,
  dataEntityId,
  datasetStats,
  datasetVersions,
  typesCount,
  versionIdParam,
  datasetStructureVersion,
  fetchDataSetStructureLatest,
  fetchDataSetStructure,
}) => {
  const test = 1;

  return <div>Test report</div>;
};
export default TestReport;
