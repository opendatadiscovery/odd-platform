import React from 'react';
import capitalize from 'lodash/capitalize';
import split from 'lodash/split';
import slice from 'lodash/slice';
import join from 'lodash/join';

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
