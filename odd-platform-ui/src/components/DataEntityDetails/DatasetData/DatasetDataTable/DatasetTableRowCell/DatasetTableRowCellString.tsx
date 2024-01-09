import { Box } from '@mui/material';
import type { TableMeta, Column, Row } from '@tanstack/react-table';
import React, { useCallback, useState } from 'react';
import { Input } from 'components/shared/elements';
import type { TableData } from '../interfaces';

interface Props {
  value: string;
  tableMeta: TableMeta<TableData>;
  column: Column<TableData>;
  row: Row<TableData>;
  onChange: (value: unknown) => void;
}

const DatasetTableRowCellString: React.FC<Props> = ({
  value,
  tableMeta,
  column,
  row,
  onChange,
}) => {
  const isEditing = row.getIsSelected();

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  }, []);

  return isEditing ? (
    <Input variant='main-m' value={value} onChange={handleChange} />
  ) : (
    <Box>{value}</Box>
  );
};

export default DatasetTableRowCellString;
