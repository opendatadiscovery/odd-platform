import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { LookupTable } from 'generated-sources';
import { flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button, ScrollableContainer } from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import { useDatasetDataTable } from './DatasetDataTable/hooks';
import * as S from './DatasetDataTable/DatasetDataTable.styles';
import DatasetDataTableRowForm from './DatasetDataTable/DatasetDataTableRowForm';

interface DatasetDataTableProps {
  lookupTable: LookupTable;
}
const DatasetDataTable = ({ lookupTable }: DatasetDataTableProps) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { table, rows, fetchMoreOnBottomReached } = useDatasetDataTable(lookupTable);
  const [isFormShow, setIsFormShow] = useState(false);

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const onAddRow = useCallback(() => {
    setIsFormShow(true);
  }, []);

  const { getVirtualItems } = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 98,
    overscan: 30,
  });

  return (
    <ScrollableContainer
      onScroll={e => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
      ref={tableContainerRef}
      mt={2}
    >
      <form name='reference-data-row-form'>
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
            {isFormShow ? (
              <DatasetDataTableRowForm lookupTable={lookupTable} />
            ) : (
              <S.Tr>
                <S.Td colSpan={table.getAllColumns().length}>
                  <Button buttonType='tertiary-m' icon={<AddIcon />} onClick={onAddRow} />
                </S.Td>
              </S.Tr>
            )}
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
          </tbody>
        </S.Table>
      </form>
    </ScrollableContainer>
  );
};

export default DatasetDataTable;
