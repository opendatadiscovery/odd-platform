import React from 'react';
import type { DataSetStats, DataSetVersion } from 'generated-sources';
import type { DataSetStructureTypesCount } from 'redux/interfaces';
import { Grid } from '@mui/material';
import DatasetFieldOverview from './DatasetFieldOverview/DatasetFieldOverview';
import DatasetStructureList from './DatasetStructureList/DatasetStructureList';
import DatasetStructureHeader from './DatasetStructureHeader/DatasetStructureHeader';

interface DatasetStructureViewProps {
  dataEntityId: number;
  versionId?: number;
  datasetStructureVersion?: number;
  fieldsCount: DataSetStats['fieldsCount'];
  typesCount: DataSetStructureTypesCount;
  datasetVersions?: DataSetVersion[];
}

const DatasetStructureView: React.FC<DatasetStructureViewProps> = ({
  dataEntityId,
  versionId,
  datasetStructureVersion,
  fieldsCount,
  typesCount,
  datasetVersions,
}) => (
  <Grid container>
    <DatasetStructureHeader
      dataEntityId={dataEntityId}
      datasetStructureVersion={datasetStructureVersion}
      fieldsCount={fieldsCount}
      typesCount={typesCount}
      datasetVersions={datasetVersions}
    />
    <Grid container sx={{ borderTop: '1px solid', borderTopColor: 'divider' }}>
      <Grid item lg={6}>
        <DatasetStructureList dataEntityId={dataEntityId} versionId={versionId} />
      </Grid>
      <Grid item lg={6} sx={{ borderLeft: '1px solid', borderLeftColor: 'divider' }}>
        <DatasetFieldOverview />
      </Grid>
    </Grid>
  </Grid>
);

export default DatasetStructureView;
