import React from 'react';
import { Grid } from '@mui/material';
import { DataSetField } from 'generated-sources';
import DatasetStructureList from './DatasetStructureList/DatasetStructureList';
import { StylesType } from './DatasetStructureTableStyles';

interface DatasetStructureTableProps extends StylesType {
  dataEntityId: number;
  versionId?: number;
  datasetStructureRoot: DataSetField[];
}

const DatasetStructureTable: React.FC<DatasetStructureTableProps> = ({
  classes,
  dataEntityId,
  versionId,
  datasetStructureRoot,
}) => (
  <>
    <Grid item xs={12} className={classes.container}>
      <Grid container className={classes.tableHeader}>
        <Grid item xs={6} container>
          <Grid item className={classes.nameCol}>
            Column
          </Grid>
        </Grid>
        <Grid item xs={2} container className={classes.columnDivided}>
          <Grid item xs={6} className={classes.uniqCol}>
            Unique
          </Grid>
          <Grid item xs={6} className={classes.missingCol}>
            Missing
          </Grid>
        </Grid>
        <Grid item xs={4} className={classes.statsCol}>
          Stats
        </Grid>
      </Grid>
    </Grid>
    <Grid item xs={12} container>
      <DatasetStructureList
        dataEntityId={dataEntityId}
        versionId={versionId}
        datasetStructureRoot={datasetStructureRoot}
        datasetRowsCount={datasetStructureRoot.length}
      />
    </Grid>
  </>
);
export default DatasetStructureTable;
