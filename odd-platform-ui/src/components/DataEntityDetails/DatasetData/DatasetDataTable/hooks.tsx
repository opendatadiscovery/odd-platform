import React, { useCallback, useMemo } from 'react';
import type { LookupTable } from 'generated-sources';
import { LookupTableFieldType } from 'generated-sources';
import { useGetReferenceData } from 'lib/hooks/api/masterData/referenceData';
import type { ColumnDef } from '@tanstack/react-table';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Typography } from '@mui/material';
import DatasetDataTableRowActions from './DatasetDataTableRowActions';
import { HiddenBox } from './DatasetDataTable.styles';

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

  const flatData = useMemo(() => {
    if (!data?.pages) return [];

    return data.pages
      .flatMap(page => page.items)
      .map(row =>
        row.items.reduce(
          (acc, item) => {
            acc[item.fieldId] = item.value;
            return acc;
          },
          {} as Record<string, unknown>
        )
      );
  }, [data?.pages]);

  const columns = useMemo(
    () => [
      ...lookupTable.fields.map(({ fieldId, name, fieldType }) => ({
        accessorKey: String(fieldId),
        header: () => <Typography variant='caption'>{name}</Typography>,
        size: calcColumnSize(fieldType),
      })),
      {
        accessorKey: 'actions',
        header: null,
        size: 100,
        cell: ({ row }: any) => (
          <HiddenBox>
            <DatasetDataTableRowActions
              lookupTableId={lookupTable.tableId}
              rowId={row.original[lookupTable.fields[0].fieldId]}
            />
          </HiddenBox>
        ),
      },
    ],
    [lookupTable.fields]
  );

  const totalDBRowCount = data?.pages?.[0]?.pageInfo.total ?? 0;
  const totalFetched = flatData.length;

  const table = useReactTable({
    data: flatData,
    columns: columns as ColumnDef<Record<string, unknown>, any>[],
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
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
