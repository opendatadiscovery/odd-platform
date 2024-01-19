import { Box, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppDatePicker } from 'components/shared/elements';
import { format, isValid } from 'date-fns';
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
  const [date, setDate] = useState(initialValue);
  const handleChange = useCallback((v: typeof initialValue) => {
    setDate(v);
  }, []);

  const defaultDate = useMemo(
    () => (date ? format(date, POSTGRES_DATE_FORMAT) : undefined),
    [date]
  );

  useEffect(() => {
    if (date && isValid(date) && isEditing) {
      onChange(format(date, POSTGRES_DATE_FORMAT));
      return;
    }
    onChange(null);
  }, [date, isEditing]);

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
