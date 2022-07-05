import React from 'react';
import { Grid } from '@mui/material';
import {
  ActivityMultipleFilterOption,
  ActivityMultipleQueryName,
} from 'redux/interfaces';
import MultipleFilterAutocomplete from './MultipleFilterAutocomplete/MultipleFilterAutocomplete';
import SelectedFilterOption from './SelectedFilterOption/SelectedFilterOption';

interface MultipleFilterProps {
  name: string;
  filterName: ActivityMultipleQueryName;
}

const MultipleFilter: React.FC<MultipleFilterProps> = ({
  name,
  filterName,
}) => {
  const [selectedOptions, setSelectedOptions] = React.useState<
    Array<ActivityMultipleFilterOption> | undefined
  >(undefined);

  const handleSetSelectedOptions = React.useCallback(
    (options: Array<ActivityMultipleFilterOption>) =>
      setSelectedOptions(options),
    [setSelectedOptions]
  );
  console.log('selectedOptions', selectedOptions);
  return (
    <Grid container>
      <Grid item xs={12}>
        <MultipleFilterAutocomplete
          name={name}
          filterName={filterName}
          // selectedOptionIds={selectedOptionIds}
          setSelectedOptions={handleSetSelectedOptions}
        />
      </Grid>
      <Grid
        display="inline-flex"
        item
        xs={12}
        sx={{ my: 0.25, mx: -0.25 }}
        container
      >
        {selectedOptions &&
          selectedOptions?.length > 0 &&
          selectedOptions.map(option => (
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
