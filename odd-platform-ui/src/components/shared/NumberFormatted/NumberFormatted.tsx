import React from 'react';

interface Props {
  value: string | number | undefined;
  precision?: number;
}

const NumberFormatted: React.FC<Props> = ({ value, precision = 0 }) => {
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
  }, [value]);
  return (
    <span title={numVal && numVal > 1000 ? numVal.toLocaleString() : ''}>
      {formatNumber()}
    </span>
  );
};

export default NumberFormatted;
