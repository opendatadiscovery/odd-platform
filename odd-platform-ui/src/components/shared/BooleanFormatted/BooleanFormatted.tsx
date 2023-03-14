import React from 'react';

export interface BooleanFormattedProps {
  value: string | boolean | undefined;
}

const BooleanFormatted: React.FC<BooleanFormattedProps> = ({ value }) => (
  <>{value === true || value === 'true' ? 'Yes' : 'No'}</>
);

export default BooleanFormatted;
