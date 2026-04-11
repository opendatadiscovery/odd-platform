import React, { type FC, type MouseEventHandler } from 'react';
import * as S from './Option.styles';

interface OptionProps {
  value: string;
  selected: boolean;
  onClick: MouseEventHandler<HTMLSpanElement>;
}

const Option: FC<OptionProps> = ({ value, selected, onClick }) => (
  <S.Option variant='body1' $selected={selected} onClick={onClick}>
    {value}
  </S.Option>
);

export default Option;
