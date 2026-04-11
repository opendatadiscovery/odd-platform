import React from 'react';
import capitalize from 'lodash/capitalize';
import split from 'lodash/split';
import slice from 'lodash/slice';
import join from 'lodash/join';

export interface TextFormattedProps {
  value: string | undefined;
  removePrefix?: boolean;
}

const TextFormatted: React.FC<TextFormattedProps> = ({ value, removePrefix }) => (
  <>{value && capitalize(join(slice(split(value, '_'), removePrefix ? 1 : 0), ' '))}</>
);

export default TextFormatted;
