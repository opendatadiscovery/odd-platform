import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Column, Row, Table } from '@tanstack/react-table';
import { LookupTableFieldType } from 'generated-sources';
import {
  AppDatePicker,
  AppDateTimePicker,
  Checkbox,
  Input,
} from 'components/shared/elements';
import type { TableData } from './interfaces';

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
  const { meta: columnMeta } = column.columnDef;
  const { meta: tableMeta } = table.options;

  const readValue = useCallback(() => {
    const v = getValue();
    switch (columnMeta?.fieldType) {
      case LookupTableFieldType.DATE:
        return new Date(v as string).toLocaleDateString();
      case LookupTableFieldType.TIME:
        return new Date(v as string).toLocaleTimeString();
      case LookupTableFieldType.BOOLEAN:
        return Boolean(v);
      case LookupTableFieldType.DECIMAL:
        return Number(v);
      case LookupTableFieldType.INTEGER:
        return Number(v);
      default:
        return String(v);
    }
  }, [columnMeta?.fieldType]);

  const initialValue = readValue();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (row.getIsSelected()) {
      const editedRowsData = { ...tableMeta?.editedRowsData };
      editedRowsData[row.id] = {
        ...editedRowsData[row.id],
        [column.id]: value,
      };
      tableMeta?.setEditedRowsData(editedRowsData);
    }
  }, [value, tableMeta?.setEditedRowsData, row.getIsSelected]);

  useEffect(() => {
    if (!row.getIsSelected()) {
      setValue(initialValue);
    }
  }, [row.getIsSelected, initialValue]);

  const renderInput = (type?: LookupTableFieldType) => {
    switch (type) {
      case LookupTableFieldType.VARCHAR:
        return (
          <Input
            variant='main-m'
            value={value as string}
            onChange={event => setValue(event.target.value)}
          />
        );
      case LookupTableFieldType.BOOLEAN:
        return (
          <Checkbox value={value} onChange={event => setValue(event.target.value)} />
        );
      case LookupTableFieldType.DATE:
        return (
          <AppDatePicker
            disableMaskedInput
            defaultDate={value as string}
            onChange={v => {
              if (v instanceof Date) {
                setValue(v.toDateString());
              } else {
                setValue('');
              }
            }}
          />
        );
      case LookupTableFieldType.TIME:
        return (
          <AppDateTimePicker
            disableMaskedInput
            value={new Date(value as string)}
            onChange={v => {
              if (v instanceof Date) {
                setValue(v.toISOString());
              } else {
                setValue('');
              }
            }}
          />
        );
      case LookupTableFieldType.INTEGER:
        return (
          <Input
            type='number'
            variant='main-m'
            value={Number(value)}
            onChange={event => setValue(event.target.value)}
          />
        );
      case LookupTableFieldType.DECIMAL:
        return (
          <Input
            type='number'
            variant='main-m'
            step='.01'
            value={Number(value)}
            onChange={event => setValue(event.target.value)}
          />
        );
      default:
        return <Input variant='main-m' />;
    }
  };

  return row.getIsSelected() ? renderInput(columnMeta?.fieldType) : value;
};

export default DatasetDataTableRowCell;
