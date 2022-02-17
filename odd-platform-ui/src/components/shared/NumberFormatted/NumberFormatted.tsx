import React from 'react';
import { Box, BoxProps } from '@mui/material';

export interface NumberFormattedProps
  extends Pick<BoxProps, 'sx' | 'component'> {
  value: string | number | undefined;
  precision?: number;
}

const NumberFormatted: React.FC<NumberFormattedProps> = ({
  value,
  precision = 0,
  sx,
  component = 'span',
}) => {
  const numVal = typeof value === 'string' ? parseInt(value, 10) : value;
  const formatNumber = React.useCallback(() => {
    if (numVal === 0) return 0;
    if (!numVal) return '';
    const pow = Math.floor(Math.log2(numVal) / 10);
    const multiplier = 10 ** precision;
    return (
      Math.round((numVal * multiplier) / 1000 ** pow) / multiplier +
      ['', 'K', 'M', 'B', 'T'][pow]
    );
  }, [value, precision]);

  return (
    <Box
      sx={sx}
      component={component}
      title={numVal && numVal > 1000 ? numVal.toLocaleString() : ''}
      data-testid="number-formatted-component"
    >
      {formatNumber()}
    </Box>
  );
};

export default NumberFormatted;
