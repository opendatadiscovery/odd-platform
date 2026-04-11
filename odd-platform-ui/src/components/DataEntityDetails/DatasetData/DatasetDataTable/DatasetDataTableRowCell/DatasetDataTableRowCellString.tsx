import { Box, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Input } from 'components/shared/elements';
import type { RowCellProps } from './interfaces';

interface Props extends RowCellProps {
  value: string;
}

const DatasetDataTableRowCellString: React.FC<Props> = ({
  value: initialValue,
  isEditing,
  onChange,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
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
      defaultValue={initialValue}
      value={value}
      onChange={handleChange}
    />
  ) : (
    <Box>
      <Typography variant='body1'>{initialValue}</Typography>
    </Box>
  );
};

export default DatasetDataTableRowCellString;
