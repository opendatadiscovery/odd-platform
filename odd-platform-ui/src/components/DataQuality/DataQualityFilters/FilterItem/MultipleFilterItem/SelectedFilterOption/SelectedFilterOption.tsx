import React from 'react';
import { Typography } from '@mui/material';
import { Button } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import * as S from './SelectedFilterOptionStyles';
import type { FilterOption } from '../../interfaces';

interface FilterItemProps {
  selectedOption: FilterOption;
  setSelectedOptions: (value: React.SetStateAction<FilterOption[]>) => void;
}

const SelectedFilterOption: React.FC<FilterItemProps> = ({
  selectedOption,
  setSelectedOptions,
}) => {
  const onRemoveClick = () => {
    setSelectedOptions((prevOptions: FilterOption[]) =>
      prevOptions.filter(option => option.id !== selectedOption.id)
    );
  };

  return (
    <S.Container sx={{ mt: 0.5, mx: 0.25 }}>
      <Typography noWrap>{selectedOption.name}</Typography>
      <Button
        sx={{ ml: 0.5 }}
        buttonType='linkGray-m'
        icon={<ClearIcon />}
        onClick={onRemoveClick}
      />
    </S.Container>
  );
};

export default SelectedFilterOption;
