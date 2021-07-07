import React from 'react';

interface Props {
  value: string | boolean | undefined;
}

const BooleanFormatted: React.FC<Props> = ({ value }) => (
  <>{value === true || value === 'true' ? 'Yes' : 'No'}</>
);

export default BooleanFormatted;
