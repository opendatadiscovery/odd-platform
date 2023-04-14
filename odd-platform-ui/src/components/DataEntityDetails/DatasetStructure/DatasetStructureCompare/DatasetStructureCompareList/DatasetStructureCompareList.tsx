import type { FC } from 'react';
import React, { useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { DataSetVersionDiff } from 'lib/interfaces';
import DatasetStructureCompareListItem from './DatasetStructureCompareListItem/DatasetStructureCompareListItem';
import * as S from './DatasetStructureCompareList.styles';

interface DatasetStructureCompareListProps {
  compareList: DataSetVersionDiff[];
}

const DatasetStructureCompareList: FC<DatasetStructureCompareListProps> = ({
  compareList,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: compareList.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 44,
    overscan: 20,
  });

  const data = virtualizer.getVirtualItems();

  const initialStateOpen = useCallback(
    (nesting: number) =>
      (data.length < 5 && nesting < 2) || (data.length < 20 && nesting < 1),
    [data.length]
  );

  const renderCompareItem = useCallback(
    (fieldDiff: DataSetVersionDiff, nesting: number) => (
      <DatasetStructureCompareListItem
        fieldDiff={fieldDiff}
        nesting={nesting}
        initialStateOpen={initialStateOpen(nesting)}
        renderCompareItem={renderCompareItem}
      />
    ),
    [initialStateOpen]
  );

  return (
    <S.Scrollable ref={containerRef}>
      <S.Container $height={virtualizer.getTotalSize()}>
        {data.map(({ key, index, start }) => (
          <S.ItemContainer
            key={key}
            data-index={index}
            $translateY={start}
            ref={virtualizer.measureElement}
          >
            {renderCompareItem(compareList[index], 0)}
          </S.ItemContainer>
        ))}
      </S.Container>
    </S.Scrollable>
  );
};

export default DatasetStructureCompareList;
