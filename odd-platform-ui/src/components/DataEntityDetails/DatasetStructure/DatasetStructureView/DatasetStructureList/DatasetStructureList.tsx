import React from 'react';
import type { DataSetField, DataSetStats } from 'generated-sources';
import { useVirtualizer } from '@tanstack/react-virtual';
import DatasetStructureItem from './DatasetStructureItem/DatasetStructureItem';
import * as S from './DatasetStructureListStyles';
import { useStructureContext } from '../../StructureContext/StructureContext';

interface DatasetStructureListProps {
  dataEntityId: number;
  versionId?: number;
  datasetRowsCount: DataSetStats['rowsCount'];
}

const DatasetStructureList: React.FC<DatasetStructureListProps> = ({
  dataEntityId,
  versionId,
  datasetRowsCount,
}) => {
  const { idxToScroll, isSearchUpdated, datasetStructureRoot } = useStructureContext();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const structureLength = datasetStructureRoot.length;

  const virtualizer = useVirtualizer({
    count: structureLength,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 150,
    overscan: 20,
  });

  const items = virtualizer.getVirtualItems();

  React.useEffect(() => {
    if (idxToScroll > -1) {
      virtualizer.scrollToIndex(idxToScroll, { align: 'start' });
    }
  }, [isSearchUpdated]);

  const initialStateOpen = React.useCallback(
    (nesting: number) =>
      (structureLength < 5 && nesting < 2) || (structureLength < 20 && nesting < 1),
    [structureLength]
  );

  const renderStructureItem = React.useCallback(
    (field: DataSetField, nesting: number, rowHeight?: number) => (
      <DatasetStructureItem
        key={field.id}
        dataEntityId={dataEntityId}
        versionId={versionId}
        datasetField={field}
        nesting={nesting}
        rowsCount={datasetRowsCount}
        initialStateOpen={initialStateOpen(nesting)}
        renderStructureItem={renderStructureItem}
        rowHeight={rowHeight}
      />
    ),
    [structureLength, datasetRowsCount, dataEntityId, versionId]
  );

  return (
    <S.Scrollable ref={containerRef}>
      <S.Container $height={virtualizer.getTotalSize()}>
        <S.ItemContainer $translateY={items[0].start}>
          {items.map(({ key, index, size }) => (
            <div key={key} data-index={index} ref={virtualizer.measureElement}>
              {renderStructureItem(datasetStructureRoot[index], 0, size)}
            </div>
          ))}
        </S.ItemContainer>
      </S.Container>
    </S.Scrollable>
  );
};

export default DatasetStructureList;
