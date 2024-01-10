import React, { useCallback } from 'react';
import type { Column, Row, Table } from '@tanstack/react-table';
import { LookupTableFieldType } from 'generated-sources';
import { Typography } from '@mui/material';
import type { TableData } from './interfaces';
import DatasetDataTableRowCellString from './DatasetDataTableRowCell/DatasetDataTableRowCellString';
import DatasetDataTableRowCellBoolean from './DatasetDataTableRowCell/DatasetDataTableRowCellBoolean';
import DatasetDataTableRowCellNumber from './DatasetDataTableRowCell/DatasetDataTableRowCellNumber';
import DatasetDataTableRowCellDate from './DatasetDataTableRowCell/DatasetDataTableRowCellDate';

// https://tanstack.com/table/v8/docs/api/core/column-def#cell
interface DatasetDataTableRowCellProps {
  table: Table<TableData>;
  column: Column<TableData>;
  row: Row<TableData>;
  getValue: () => unknown; // We trust that backend returns correct value for each column type,
  // so we can type coercion here by blind casting String, Boolean, etc.
}

const DatasetDataTableRowCell = ({
  getValue,
  column,
  table,
  row,
}: DatasetDataTableRowCellProps) => {
  const { meta: columnMeta } = column.columnDef;
  const { meta: tableMeta } = table.options;
  const isEditing = row.getIsSelected();

  const onChange = useCallback(
    (v: unknown) => {
      tableMeta?.setEditedRowsData(prev => ({
        ...prev,
        [row.id]: {
          ...prev[row.id],
          [column.id]: v,
        },
      }));
    },
    [row.id, column.id]
  );

  const renderCell = (type?: LookupTableFieldType) => {
    const value = getValue();
    if (value === undefined)
      return <Typography variant='body1'>{String(value)}</Typography>;
    switch (type) {
      case LookupTableFieldType.VARCHAR:
        return (
          <DatasetDataTableRowCellString
            value={String(value)}
            onChange={onChange}
            isEditing={isEditing}
          />
        );
      case LookupTableFieldType.BOOLEAN:
        return (
          <DatasetDataTableRowCellBoolean
            value={JSON.parse(String(value))}
            onChange={onChange}
            isEditing={isEditing}
          />
        );
      case LookupTableFieldType.INTEGER:
        return (
          <DatasetDataTableRowCellNumber
            value={Number(value)}
            onChange={onChange}
            isEditing={isEditing}
          />
        );
      case LookupTableFieldType.DECIMAL:
        return (
          <DatasetDataTableRowCellNumber
            value={Number(value)}
            onChange={onChange}
            isEditing={isEditing}
            float
          />
        );

      case LookupTableFieldType.DATE:
        return (
          <DatasetDataTableRowCellDate
            value={value ? new Date(String(value)) : null}
            onChange={onChange}
            isEditing={isEditing}
          />
        );
      default:
        return <Typography variant='body1'>{String(value)}</Typography>;
    }
  };

  return renderCell(columnMeta?.fieldType);
};

export default DatasetDataTableRowCell;
