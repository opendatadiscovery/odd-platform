import type { FC } from 'react';
import React, { useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { DataSetVersionDiff } from 'lib/interfaces';
import DatasetStructureCompareListItem from './DatasetStructureCompareListItem/DatasetStructureCompareListItem';
import * as S from './DatasetStructureCompareList.styles';

interface DatasetStructureCompareListProps {
  compareList: DataSetVersionDiff[];
  isNested?: boolean;
}

const DatasetStructureCompareList: FC<DatasetStructureCompareListProps> = ({
  compareList,
  isNested,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: compareList.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 44,
    overscan: 20,
  });

  const data = virtualizer.getVirtualItems();

  const renderCompareItem = useCallback(
    (fieldDiff: DataSetVersionDiff, nesting: number) => (
      <DatasetStructureCompareListItem
        fieldDiff={fieldDiff}
        isNested={isNested}
        nesting={nesting}
        renderCompareItem={renderCompareItem}
      />
    ),
    [isNested]
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
