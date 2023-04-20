import React from 'react';
import { Typography } from '@mui/material';
import { ClearIcon } from 'components/shared/icons';
import {
  type ActivityFilterOption,
  type ActivityMultipleFilterNames,
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import { useQueryParams } from 'lib/hooks';
import AppIconButton from 'components/shared/elements/AppIconButton/AppIconButton';
import TextFormatted from 'components/shared/elements/TextFormatted/TextFormatted';
import { Container } from 'components/shared/elements/Activity/ActivityFilterItems/MultipleFilter/SelectedFilterOption/SelectedFilterOptionStyles';

interface SelectedFilterOptionProps {
  selectedOption: ActivityFilterOption;
  filterName: ActivityMultipleFilterNames;
}

const SelectedFilterOption: React.FC<SelectedFilterOptionProps> = ({
  selectedOption,
  filterName,
}) => {
  const { setQueryParams } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const onRemoveClick = () => {
    setQueryParams(prev => ({
      ...prev,
      [filterName]: prev[filterName]?.filter(id => id !== selectedOption.id),
    }));
  };

  return (
    <Container sx={{ mt: 0.5, mx: 0.25 }}>
      <Typography noWrap title={selectedOption.name}>
        <TextFormatted value={selectedOption.name} />
      </Typography>
      <AppIconButton
        sx={{ ml: 0.5 }}
        size='small'
        color='unfilled'
        icon={<ClearIcon />}
        onClick={onRemoveClick}
      />
    </Container>
  );
};

export default SelectedFilterOption;
