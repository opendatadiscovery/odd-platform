import React from 'react';
import type { DataSetField, DataSetStats } from 'generated-sources';
import { useVirtualizer } from '@tanstack/react-virtual';
import DatasetStructureItem from './DatasetStructureItem/DatasetStructureItem';
import * as S from './DatasetStructureListStyles';

interface DatasetStructureListProps {
  dataEntityId: number;
  versionId?: number;
  datasetStructureRoot: DataSetField[];
  datasetRowsCount: DataSetStats['rowsCount'];
  idxToScroll: number;
}

const DatasetStructureList: React.FC<DatasetStructureListProps> = ({
  dataEntityId,
  versionId,
  datasetStructureRoot,
  datasetRowsCount,
  idxToScroll,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: datasetStructureRoot.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 150,
    overscan: 20,
  });

  React.useEffect(() => {
    if (idxToScroll > 0) virtualizer.scrollToIndex(idxToScroll, { align: 'start' });
  }, [idxToScroll]);

  const rootStructureItems = React.useMemo(
    () => datasetStructureRoot.filter(field => !field.parentFieldId),
    [datasetStructureRoot]
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
        initialStateOpen={
          (datasetStructureRoot?.length < 5 && nesting < 2) ||
          (datasetStructureRoot?.length < 20 && nesting < 1)
        }
        renderStructureItem={renderStructureItem}
        rowHeight={rowHeight}
      />
    ),
    [datasetStructureRoot, datasetRowsCount, dataEntityId, versionId]
  );

  const items = virtualizer.getVirtualItems();

  return (
    <S.Scrollable ref={containerRef}>
      <S.Container $height={virtualizer.getTotalSize()}>
        <S.ItemContainer $translateY={items[0].start}>
          {items.map(({ key, index, size }) => (
            <div key={key} data-index={index} ref={virtualizer.measureElement}>
              {renderStructureItem(rootStructureItems[index], 0, size)}
            </div>
          ))}
        </S.ItemContainer>
      </S.Container>
    </S.Scrollable>
  );
};

export default DatasetStructureList;
