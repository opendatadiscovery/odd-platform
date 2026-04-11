import React, { useCallback, useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { Input } from 'components/shared/elements';
import type { RowCellProps } from './interfaces';

interface Props extends RowCellProps {
  value: number;
  float?: boolean;
}

const DatasetDataTableRowCellNumber = ({
  value: initialValue,
  isEditing,
  onChange,
  float,
}: Props) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value));
  }, []);

  useEffect(() => {
    if (isEditing) {
      onChange(value);
      return;
    }
    // reset value on cancel
    setValue(initialValue);
  }, [value, isEditing]);

  return isEditing ? (
    <Input
      variant='main-m'
      type='number'
      defaultValue={initialValue}
      value={value}
      step={float ? '.01' : '1'}
      onChange={handleChange}
    />
  ) : (
    <Typography variant='body1'>{initialValue}</Typography>
  );
};

export default DatasetDataTableRowCellNumber;
