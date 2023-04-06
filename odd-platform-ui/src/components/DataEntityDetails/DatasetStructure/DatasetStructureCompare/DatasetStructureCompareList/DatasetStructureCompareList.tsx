import type { FC } from 'react';
import React, { useMemo, useRef } from 'react';
import type { DataSetVersionDiff } from 'generated-sources';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAtom } from 'jotai';
import DatasetStructureCompareListItem from './DatasetStructureCompareListItem/DatasetStructureCompareListItem';
import { showOnlyChangesAtom } from '../lib/atoms';
import * as S from './DatasetStructureCompareList.styles';

interface DatasetStructureCompareListProps {
  compareList: DataSetVersionDiff[];
}

const DatasetStructureCompareList: FC<DatasetStructureCompareListProps> = ({
  compareList,
}) => {
  const [showChangesOnly] = useAtom(showOnlyChangesAtom);

  const list = useMemo(() => {
    if (showChangesOnly) {
      return compareList.filter(item => item.status !== 'NO_CHANGES');
    }

    return compareList;
  }, [showChangesOnly, compareList]);

  const containerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: list.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 44,
    overscan: 20,
  });

  return (
    <S.Scrollable ref={containerRef}>
      <S.Container $height={virtualizer.getTotalSize()}>
        {virtualizer.getVirtualItems().map(({ key, index, start }) => (
          <S.ItemContainer key={key} data-index={index} $translateY={start}>
            <DatasetStructureCompareListItem
              status={list[index].status}
              states={list[index].states}
            />
          </S.ItemContainer>
        ))}
      </S.Container>
    </S.Scrollable>
  );
};

export default DatasetStructureCompareList;
