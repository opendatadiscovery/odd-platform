import React from 'react';
import { Grid } from '@mui/material';
import { ActivityMultipleFilterName } from 'redux/interfaces';
import { useAppSelector } from 'lib/redux/hooks';
import { getActivitiesSelectedMultipleFiltersByFilterName } from 'redux/selectors';
import MultipleFilterAutocomplete from './MultipleFilterAutocomplete/MultipleFilterAutocomplete';
import SelectedFilterOption from './SelectedFilterOption/SelectedFilterOption';

interface MultipleFilterProps {
  name: string;
  filterName: ActivityMultipleFilterName;
}

const MultipleFilter: React.FC<MultipleFilterProps> = ({
  name,
  filterName,
}) => {
  const selectedOptions = useAppSelector(state =>
    getActivitiesSelectedMultipleFiltersByFilterName(state, filterName)
  );

  return (
    <Grid container>
      <Grid item xs={12}>
        <MultipleFilterAutocomplete name={name} filterName={filterName} />
      </Grid>
      <Grid
        display="inline-flex"
        item
        xs={12}
        sx={{ my: 0.25, mx: -0.25 }}
        container
      >
        {selectedOptions?.map(option => (
          <SelectedFilterOption
            key={option.id}
            filterName={filterName}
            selectedOption={option}
          />
        ))}
      </Grid>
    </Grid>
  );
};
export default MultipleFilter;
