import React from 'react';
import { Grid } from '@mui/material';
import { DataSetField } from 'generated-sources';
import VirtualList from 'components/shared/VirtualList/VirtualList';
import { StylesType } from './DatasetStructureTableStyles';
import DatasetStructureItemContainer from './DatasetStructureItem/DatasetStructureItemContainer';

interface DatasetStructureTableProps extends StylesType {
  dataEntityId: number;
  versionId?: number;
  datasetStructureRoot: DataSetField[];
  datasetRowsCount: number;
}

const DatasetStructureTable: React.FC<DatasetStructureTableProps> = ({
  classes,
  dataEntityId,
  versionId,
  datasetStructureRoot,
  datasetRowsCount,
}) => {
  const renderStructureItem = React.useCallback(
    (field: DataSetField, nesting: number) => (
      <DatasetStructureItemContainer
        key={field.id}
        dataEntityId={dataEntityId}
        versionId={versionId}
        datasetField={field}
        nesting={nesting}
        rowsCount={datasetRowsCount}
        initialStateOpen={
          (datasetStructureRoot?.length < 5 && nesting < 2) ||
          (datasetStructureRoot?.length < 20 && nesting < 1)
        }
        renderStructureItem={renderStructureItem}
      />
    ),
    [datasetStructureRoot, datasetRowsCount, dataEntityId, versionId]
  );

  const structureItems = datasetStructureRoot.map(field =>
    field.parentFieldId ? null : renderStructureItem(field, 0)
  );

  return (
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
        <VirtualList
          data={structureItems}
          rowCount={datasetStructureRoot.length}
        />
      </Grid>
    </>
  );
};

export default DatasetStructureTable;
