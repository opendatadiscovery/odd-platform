import React from 'react';
import { useDispatch } from 'react-redux';
import { Typography } from '@mui/material';
import TextFormatted from 'components/shared/TextFormatted/TextFormatted';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import {
  ActivityMultipleFilterOption,
  ActivityMultipleQueryName,
} from 'redux/interfaces';
import { useUpdateActivityQuery } from 'lib/redux/hooks';
import { Container } from './SelectedFilterOptionStyles';

interface SelectedFilterOptionProps {
  selectedOption: ActivityMultipleFilterOption;
  filterName: ActivityMultipleQueryName;
}

const SelectedFilterOption: React.FC<SelectedFilterOptionProps> = ({
  selectedOption,
  filterName,
}) => {
  const dispatch = useDispatch();

  const onRemoveClick = () => {
    useUpdateActivityQuery(
      filterName,
      selectedOption.id,
      'delete',
      dispatch
    );
  };

  return (
    <Container sx={{ mt: 0.5, mx: 0.25 }}>
      <Typography noWrap title={selectedOption.name}>
        <TextFormatted value={selectedOption.name} />
      </Typography>
      <AppIconButton
        sx={{ ml: 0.5 }}
        size="small"
        color="unfilled"
        icon={<ClearIcon />}
        onClick={onRemoveClick}
      />
    </Container>
  );
};

export default SelectedFilterOption;
