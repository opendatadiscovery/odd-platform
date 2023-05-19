import React, { type FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppParams } from 'lib/hooks';
import type { DataSetField } from 'generated-sources';
import useStructure from '../../lib/useStructure';
import DatasetStructureItem from './DatasetStructureItem/DatasetStructureItem';
import * as S from './DatasetStructureList.styles';

const DatasetStructureList: FC = () => {
  const { dataEntityId, versionId } = useAppParams();
  const { datasetStructureRoot, idxToScroll, isSearchUpdated } = useStructure();

  const containerRef = useRef<HTMLDivElement>(null);
  const structureLength = useMemo(
    () => datasetStructureRoot.length || 0,
    [datasetStructureRoot.length]
  );

  const virtualizer = useVirtualizer({
    count: structureLength,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 46,
    overscan: 20,
  });

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    if (idxToScroll > -1) {
      virtualizer.scrollToIndex(idxToScroll, { align: 'start' });
    }
  }, [isSearchUpdated]);

  const initialStateOpen = useCallback(
    (nesting: number) =>
      (structureLength < 5 && nesting < 2) || (structureLength < 20 && nesting < 1),
    [structureLength]
  );

  const renderStructureItem = useCallback(
    (field: DataSetField, nesting: number, rowHeight?: number) => (
      <DatasetStructureItem
        key={field.id}
        dataEntityId={dataEntityId}
        versionId={versionId}
        datasetField={field}
        nesting={nesting}
        initialStateOpen={initialStateOpen(nesting)}
        renderStructureItem={renderStructureItem}
        rowHeight={rowHeight}
      />
    ),
    [initialStateOpen, dataEntityId, versionId]
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
