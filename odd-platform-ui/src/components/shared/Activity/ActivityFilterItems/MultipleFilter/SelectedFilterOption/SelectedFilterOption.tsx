import React from 'react';
import { useDispatch } from 'react-redux';
import { Typography } from '@mui/material';
import TextFormatted from 'components/shared/TextFormatted/TextFormatted';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { ActivityFilterOption, ActivityQueryName } from 'redux/interfaces';
import { deleteActivityQueryParam } from 'redux/slices/activity.slice';
import { Container } from 'components/shared/Activity/ActivityFilterItems/MultipleFilter/SelectedFilterOption/SelectedFilterOptionStyles';

interface SelectedFilterOptionProps {
  selectedOption: ActivityFilterOption;
  filterName: ActivityQueryName;
}

const SelectedFilterOption: React.FC<SelectedFilterOptionProps> = ({
  selectedOption,
  filterName,
}) => {
  const dispatch = useDispatch();

  const onRemoveClick = () => {
    dispatch(
      deleteActivityQueryParam({
        queryName: filterName,
        queryData: selectedOption.id,
      })
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
