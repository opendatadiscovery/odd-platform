import React, { useCallback, useEffect, useState } from 'react';
import type { Column, Row, Table } from '@tanstack/react-table';
import { LookupTableFieldType } from 'generated-sources';
import { Checkbox, Input } from 'components/shared/elements';
import type { TableData } from './interfaces';
import { readValue } from './utils';

// https://tanstack.com/table/v8/docs/api/core/column-def#cell
interface DatasetDataTableRowCellProps {
  table: Table<TableData>;
  column: Column<TableData>;
  row: Row<TableData>;
  getValue: () => unknown;
}

const DatasetDataTableRowCell = ({
  getValue,
  column,
  table,
  row,
}: DatasetDataTableRowCellProps) => {
  const initialValue = readValue(getValue());
  const [value, setValue] = useState(initialValue);
  const { meta: columnMeta } = column.columnDef;
  const { meta: tableMeta } = table.options;
  const isEditing = row.getIsSelected();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  useEffect(() => {
    if (isEditing) {
      const editedRowsData = { ...tableMeta?.editedRowsData };
      editedRowsData[row.id] = {
        ...editedRowsData[row.id],
        [column.id]: value,
      };
      tableMeta?.setEditedRowsData(editedRowsData);
    }
  }, [value, isEditing, row.id, column.id]);

  const renderInput = (type?: LookupTableFieldType) => {
    switch (type) {
      case LookupTableFieldType.VARCHAR:
        return <Input variant='main-m' value={value as string} onChange={handleChange} />;
      case LookupTableFieldType.BOOLEAN:
        return <Checkbox value={value} onChange={handleChange} />;
      case LookupTableFieldType.INTEGER:
        return (
          <Input
            type='number'
            variant='main-m'
            value={Number(value)}
            onChange={handleChange}
          />
        );
      case LookupTableFieldType.DECIMAL:
        return (
          <Input
            type='number'
            variant='main-m'
            step='.01'
            value={Number(value)}
            onChange={handleChange}
          />
        );
      default:
        return <Input variant='main-m' />;
    }
  };

  return isEditing ? renderInput(columnMeta?.fieldType) : initialValue;
};

export default DatasetDataTableRowCell;
