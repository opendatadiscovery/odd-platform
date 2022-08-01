import React from 'react';
import {
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized/dist/commonjs/CellMeasurer';
import { List, ListRowProps } from 'react-virtualized/dist/commonjs/List';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import { DataSetField } from 'generated-sources';
import DatasetStructureItemContainer from './DatasetStructureItem/DatasetStructureItemContainer';

interface DatasetStructureListProps {
  dataEntityId: number;
  versionId?: number;
  datasetStructureRoot: DataSetField[];
  datasetRowsCount: number;
  indexToScroll: number;
}

const DatasetStructureList: React.FC<DatasetStructureListProps> = ({
  dataEntityId,
  datasetRowsCount,
  datasetStructureRoot,
  versionId,
  indexToScroll,
}) => {
  const cache = new CellMeasurerCache({
    defaultHeight: 50,
    fixedWidth: true,
  });
  const rootStructureItems = React.useMemo(
    () => datasetStructureRoot.filter(field => !field.parentFieldId),
    [datasetStructureRoot]
  );
  const renderStructureItem = React.useCallback(
    (field: DataSetField, nesting: number, onSizeChange: () => void) => (
      <DatasetStructureItemContainer
        key={field.id}
        dataEntityId={dataEntityId}
        versionId={versionId}
        datasetField={field}
        nesting={nesting}
        rowsCount={datasetRowsCount}
        onSizeChange={onSizeChange}
        initialStateOpen={
          (datasetStructureRoot?.length < 5 && nesting < 2) ||
          (datasetStructureRoot?.length < 20 && nesting < 1)
        }
        renderStructureItem={renderStructureItem}
      />
    ),
    [datasetStructureRoot, datasetRowsCount, dataEntityId, versionId]
  );

  const renderListItem = ({ index, style, key, parent }: ListRowProps) => (
    <CellMeasurer
      cache={cache}
      columnIndex={0}
      key={key}
      rowIndex={index}
      parent={parent}
    >
      {({ measure }) => (
        <div style={style}>
          {renderStructureItem(rootStructureItems[index], 0, measure)}
        </div>
      )}
    </CellMeasurer>
  );

  return (
    <div style={{ height: 'calc(100vh - 245px)', width: '100vw' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            overscanRowCount={4}
            rowCount={datasetRowsCount}
            rowHeight={cache.rowHeight}
            rowRenderer={renderListItem}
            scrollToIndex={indexToScroll}
            deferredMeasurementCache={cache}
            scrollToAlignment="start"
          />
        )}
      </AutoSizer>
    </div>
  );
};

export default DatasetStructureList;
