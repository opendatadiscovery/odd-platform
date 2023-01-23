import React from 'react';
import type { DataSetField, DataSetStats, DataSetVersion } from 'generated-sources';
import type { DataSetStructureTypesCount } from 'redux/interfaces';
import { Grid } from '@mui/material';
import DatasetStructureList from './DatasetStructureList/DatasetStructureList';
import DatasetStructureHeader from './DatasetStructureHeader/DatasetStructureHeader';

interface DatasetStructureViewProps {
  showStructure: boolean;
  dataEntityId: number;
  versionId?: number;
  datasetStructureVersion?: number;
  datasetStructureRoot: DataSetField[];
  datasetRowsCount: DataSetStats['rowsCount'];
  fieldsCount: DataSetStats['fieldsCount'];
  typesCount: DataSetStructureTypesCount;
  datasetVersions?: DataSetVersion[];
}

const DatasetStructureView: React.FC<DatasetStructureViewProps> = ({
  showStructure,
  dataEntityId,
  versionId,
  datasetStructureVersion,
  datasetStructureRoot,
  datasetRowsCount,
  fieldsCount,
  typesCount,
  datasetVersions,
}) => {
  const [idxToScroll, setIdxToScroll] = React.useState(-1);

  const handleSearch = React.useCallback(
    (query: string) => {
      const itemIdx = datasetStructureRoot.findIndex(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setIdxToScroll(itemIdx);
    },
    [datasetStructureRoot]
  );

  return showStructure ? (
    <Grid container>
      <DatasetStructureHeader
        dataEntityId={dataEntityId}
        datasetStructureVersion={datasetStructureVersion}
        fieldsCount={fieldsCount}
        typesCount={typesCount}
        handleSearch={handleSearch}
        datasetVersions={datasetVersions}
      />
      <DatasetStructureList
        dataEntityId={dataEntityId}
        versionId={versionId}
        datasetStructureRoot={datasetStructureRoot}
        datasetRowsCount={datasetRowsCount}
        idxToScroll={idxToScroll}
      />
    </Grid>
  ) : null;
};
export default DatasetStructureView;
