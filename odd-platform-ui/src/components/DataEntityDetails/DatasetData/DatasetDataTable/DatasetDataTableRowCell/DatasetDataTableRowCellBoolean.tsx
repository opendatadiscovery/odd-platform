import React, { useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { AcceptIcon, RejectIcon } from 'components/shared/icons';
import { Checkbox } from 'components/shared/elements';
import type { RowCellProps } from './interfaces';

interface Props extends RowCellProps {
  value: boolean;
}

const DatasetDataTableRowCellBoolean: React.FC<Props> = ({
  value: initialValue,
  isEditing,
  onChange,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.checked);
  }, []);

  useEffect(() => {
    if (isEditing) {
      onChange(value);
      return;
    }
    // reset value on cancel
    setValue(initialValue);
  }, [value, isEditing]);

  return (
    <Box display='flex' justifyContent='start'>
      {isEditing && <Checkbox checked={value} value={value} onChange={handleChange} />}
      {!isEditing && (initialValue ? <AcceptIcon /> : <RejectIcon />)}
    </Box>
  );
};

export default DatasetDataTableRowCellBoolean;
