import React from 'react';
import { Box, type BoxProps } from '@mui/material';

export interface NumberFormattedProps extends Pick<BoxProps, 'sx' | 'component'> {
  value: string | number | undefined | null;
  precision?: number;
}

const NumberFormatted: React.FC<NumberFormattedProps> = ({
  value,
  precision = 1,
  sx,
  component = 'span',
}) => {
  let formattedNumber: number | string;

  const numVal = typeof value === 'string' ? parseInt(value, 10) : (value as number);

  const formatNumber = React.useCallback(() => {
    const lookups = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'K' },
      { value: 1e6, symbol: 'M' },
      { value: 1e9, symbol: 'B' },
      { value: 1e12, symbol: 't' },
      { value: 1e15, symbol: 'q' },
      { value: 1e18, symbol: 'Q' },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookups
      .slice()
      .reverse()
      .find(lookup => numVal >= lookup.value);

    return item
      ? (numVal / item.value).toFixed(precision).replace(rx, '$1') + item.symbol
      : '0';
  }, [value, precision]);

  if (numVal || numVal === 0) {
    formattedNumber = formatNumber();
  } else {
    formattedNumber = '';
  }

  return (
    <Box
      sx={sx}
      component={component}
      title={numVal && numVal > 1000 ? numVal.toLocaleString() : ''}
      data-testid='number-formatted-component'
    >
      {formattedNumber}
    </Box>
  );
};

export default NumberFormatted;
