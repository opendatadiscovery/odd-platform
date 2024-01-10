import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { LookupTable } from 'generated-sources';
import { flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button, ScrollableContainer } from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import { FormProvider, useForm } from 'react-hook-form';
import { useCreateReferenceData } from 'lib/hooks/api/masterData/referenceData';
import { useDatasetDataTable } from './DatasetDataTable/hooks';
import * as S from './DatasetDataTable/DatasetDataTable.styles';
import DatasetDataTableRowForm from './DatasetDataTable/DatasetDataTableRowForm';
import { buildTableRowData } from './DatasetDataTable/utils';

interface DatasetDataTableProps {
  lookupTable: LookupTable;
}
const DatasetDataTable = ({ lookupTable }: DatasetDataTableProps) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { table, rows, fetchMoreOnBottomReached } = useDatasetDataTable(lookupTable);
  const [isFormShow, setIsFormShow] = useState(false);
  const form = useForm({ mode: 'onChange' });
  const { mutateAsync: createReferenceData } = useCreateReferenceData();
  const onSubmit = useCallback(
    async (data: Record<string, string>) => {
      await createReferenceData({
        lookupTableId: lookupTable.tableId,
        lookupTableRowFormData: [buildTableRowData(data)],
      });
      setIsFormShow(false);
    },
    [setIsFormShow]
  );

  const { getVirtualItems } = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 98,
    overscan: 30,
  });

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  return (
    <ScrollableContainer
      onScroll={e => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
      ref={tableContainerRef}
      mt={2}
    >
      <FormProvider {...form}>
        <form id='reference-data-row-form' onSubmit={form.handleSubmit(onSubmit)}>
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
                <DatasetDataTableRowForm
                  lookupTable={lookupTable}
                  onCancel={() => setIsFormShow(false)}
                />
              ) : (
                <S.Tr>
                  <S.Td colSpan={table.getAllColumns().length}>
                    <Button
                      buttonType='tertiary-m'
                      icon={<AddIcon />}
                      onClick={() => setIsFormShow(true)}
                    />
                  </S.Td>
                </S.Tr>
              )}
              {getVirtualItems().map(virtualRow => {
                const row = rows[virtualRow.index];
                return (
                  <S.Tr key={JSON.stringify(row.original)}>
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
      </FormProvider>
    </ScrollableContainer>
  );
};

export default DatasetDataTable;
