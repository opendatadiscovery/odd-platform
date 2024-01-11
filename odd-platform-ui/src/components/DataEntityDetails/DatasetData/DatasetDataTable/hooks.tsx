import React, { useCallback, useMemo, useState } from 'react';
import type { LookupTable } from 'generated-sources';
import { LookupTableFieldType } from 'generated-sources';
import { useGetReferenceData } from 'lib/hooks/api/masterData/referenceData';
import type { ColumnDef, RowData, RowSelectionState } from '@tanstack/react-table';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Typography } from '@mui/material';
import DatasetDataTableRowActions from './DatasetDataTableRowActions';
import type { TableData } from './interfaces';
import DatasetDataTableRowCell from './DatasetDataTableRowCell';

type EditedRowsData = Record<string, TableData>;

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    editedRowsData: EditedRowsData;
    setEditedRowsData: React.Dispatch<React.SetStateAction<EditedRowsData>>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    fieldType: LookupTableFieldType;
  }
}

function calcColumnSize(fieldType: LookupTableFieldType) {
  switch (fieldType) {
    case LookupTableFieldType.VARCHAR:
      return 200;
    case LookupTableFieldType.DATE:
      return 225;
    case LookupTableFieldType.TIME:
      return 225;
    case LookupTableFieldType.INTEGER:
      return 100;
    case LookupTableFieldType.DECIMAL:
      return 125;
    case LookupTableFieldType.BOOLEAN:
      return 100;
    default:
      return 200;
  }
}

export const useDatasetDataTable = (lookupTable: LookupTable) => {
  const { data, fetchNextPage, isFetching } = useGetReferenceData({
    lookupTableId: lookupTable.tableId,
    size: 30,
  });

  const [editedRowsData, setEditedRowsData] = useState<EditedRowsData>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const flatData = useMemo(() => {
    if (!data?.pages) return [];

    return data.pages
      .flatMap(page => page.items)
      .map(row =>
        row.items.reduce((acc, item) => {
          acc[item.fieldId] = item.value;
          return acc;
        }, {} as TableData)
      );
  }, [data?.pages]);

  const inputFields = lookupTable.fields.filter(({ isPrimaryKey }) => !isPrimaryKey);
  const idFieldColumn = lookupTable.fields[0];

  const columns = useMemo(
    () => [
      {
        accessorKey: String(idFieldColumn.fieldId),
        header: () => <Typography variant='caption'>{idFieldColumn.name}</Typography>,
      },
      ...inputFields.map(({ fieldId, name, fieldType }) => ({
        accessorKey: String(fieldId),
        header: () => <Typography variant='caption'>{name}</Typography>,
        size: calcColumnSize(fieldType),
        meta: { fieldType },
        cell: DatasetDataTableRowCell,
      })),
      {
        accessorKey: 'actions',
        header: null,
        size: 135,
        cell: ({ row, table }: any) => (
          <DatasetDataTableRowActions
            primaryKeyFieldId={idFieldColumn.fieldId}
            lookupTableId={lookupTable.tableId}
            row={row}
            table={table}
          />
        ),
      },
    ],
    [inputFields, idFieldColumn, lookupTable.fields]
  );

  const totalDBRowCount = data?.pages?.[0]?.pageInfo.total ?? 0;
  const totalFetched = flatData.length;

  const table = useReactTable({
    data: flatData,
    columns: columns as ColumnDef<Record<string, unknown>, any>[],
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    enableMultiRowSelection: false,
    state: {
      rowSelection,
    },
    meta: {
      editedRowsData,
      setEditedRowsData,
    },
  });

  const { rows } = table.getRowModel();

  // called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (ref?: HTMLDivElement | null) => {
      if (ref) {
        const { scrollHeight, scrollTop, clientHeight } = ref;
        // once the user has scrolled within 300px of the bottom of the table, fetch more data if there is any
        if (
          scrollHeight - scrollTop - clientHeight < 300 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  return {
    table,
    rows,
    fetchMoreOnBottomReached,
  };
};
