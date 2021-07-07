import React from 'react';
import { capitalize, split, slice, join } from 'lodash';

interface Props {
  value: string | undefined;
  removePrefix?: boolean;
}

const TextFormatted: React.FC<Props> = ({ value, removePrefix }) => (
  <>
    {value &&
      capitalize(
        join(slice(split(value, '_'), removePrefix ? 1 : 0), ' ')
      )}
  </>
);

export default TextFormatted;
