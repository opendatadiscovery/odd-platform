import React from 'react';
import { Typography } from '@mui/material';
import { Button } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import * as S from './SelectedFilterOptionStyles';
import type { FilterOption } from '../../../../interfaces';

interface FilterItemProps {
  selectedOption: FilterOption;
  onDeselectOption: (value: FilterOption) => void;
}

const SelectedFilterOption: React.FC<FilterItemProps> = ({
  selectedOption,
  onDeselectOption,
}) => (
  <S.Container>
    <Typography noWrap>{selectedOption.name}</Typography>
    <Button
      sx={{ ml: 0.5 }}
      buttonType='linkGray-m'
      icon={<ClearIcon />}
      onClick={() => onDeselectOption(selectedOption)}
    />
  </S.Container>
);

export default SelectedFilterOption;
