import React from 'react';
import { Grid } from '@mui/material';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowProps,
} from 'react-virtualized';
import { DataSetField } from 'generated-sources';
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

  const listRef = React.useRef<List | null>(null);

  const cache = new CellMeasurerCache({
    defaultHeight: 40,
  });

  const renderRow = ({ index, key, style, parent }: ListRowProps) => (
    <CellMeasurer
      key={key}
      cache={cache}
      parent={parent}
      columnIndex={0}
      rowIndex={index}
    >
      <div style={style}>{structureItems[index]}</div>
    </CellMeasurer>
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
        {/* {datasetStructureRoot */}
        {/*  ? datasetStructureRoot.map(field => */}
        {/*      field.parentFieldId ? null : renderStructureItem(field, 0) */}
        {/*    ) */}
        {/*  : null} */}
        <div style={{ height: '100vh', display: 'flex', width: '100vw' }}>
          <AutoSizer>
            {({ width, height }) => (
              <List
                ref={listRef}
                width={width}
                height={height}
                rowRenderer={renderRow}
                rowCount={datasetStructureRoot.length}
                rowHeight={cache.rowHeight}
                deferredMeasurementCache={cache}
              />
            )}
          </AutoSizer>
        </div>
      </Grid>
    </>
  );
};

export default DatasetStructureTable;
