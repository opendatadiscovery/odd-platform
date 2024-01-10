import { Box, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppDatePicker } from 'components/shared/elements';
import { format } from 'date-fns';
import type { RowCellProps } from './interfaces';

interface Props extends RowCellProps {
  value: Date | null;
}

const POSTGRES_DATE_FORMAT = 'yyyy-MM-dd';

const DatasetDataTableRowCellDate: React.FC<Props> = ({
  value: initialValue,
  isEditing,
  onChange,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((date: typeof initialValue) => {
    setValue(date);
  }, []);

  useEffect(() => {
    if (isEditing) {
      // send proper date format
      onChange(value ? format(value, POSTGRES_DATE_FORMAT) : null);
      return;
    }
    // reset value on cancel
    setValue(initialValue);
  }, [value, isEditing]);

  const defaultDate = useMemo(
    () => (initialValue ? format(initialValue, POSTGRES_DATE_FORMAT) : undefined),
    [initialValue]
  );

  return isEditing ? (
    <AppDatePicker
      inputFormat={POSTGRES_DATE_FORMAT}
      defaultDate={defaultDate}
      onChange={handleChange}
    />
  ) : (
    <Box>
      <Typography variant='body1'>{defaultDate ?? 'N/A'}</Typography>
    </Box>
  );
};

export default DatasetDataTableRowCellDate;
