import React, { useEffect, useRef } from 'react';
import type { LookupTable } from 'generated-sources';
import { flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button, ScrollableContainer } from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import { useDatasetDataTable } from './DatasetDataTable/hooks';
import * as S from './DatasetDataTable/DatasetDataTable.styles';

interface DatasetDataTableProps {
  lookupTable: LookupTable;
}
const DatasetDataTable = ({ lookupTable }: DatasetDataTableProps) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { table, rows, fetchMoreOnBottomReached } = useDatasetDataTable(lookupTable);

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const { getVirtualItems } = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 20,
  });

  return (
    <ScrollableContainer
      onScroll={e => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
      ref={tableContainerRef}
    >
      <S.Table>
        <S.Thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <S.Th key={header.id} style={{ minWidth: header.getSize() }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </S.Th>
              ))}
            </tr>
          ))}
        </S.Thead>
        <tbody>
          {getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index];
            return (
              <S.Tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <S.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </S.Td>
                ))}
              </S.Tr>
            );
          })}
          <S.Tr>
            <S.Td colSpan={table.getAllColumns().length}>
              <Button buttonType='tertiary-m' icon={<AddIcon />} />
            </S.Td>
          </S.Tr>
        </tbody>
      </S.Table>
    </ScrollableContainer>
  );
};

export default DatasetDataTable;
