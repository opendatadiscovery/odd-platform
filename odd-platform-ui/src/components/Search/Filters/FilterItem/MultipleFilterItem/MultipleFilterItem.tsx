import React from 'react';
import { Grid } from '@mui/material';
import {
  OptionalFacetNames,
  SearchFilterStateSynced,
} from 'redux/interfaces/search';
import SelectedFilterOption from 'components/Search/Filters/FilterItem/SelectedFilterOption/SelectedFilterOption';
import MultipleFilterItemAutocompleteContainer from './MultipleFilterItemAutocomplete/MultipleFilterItemAutocompleteContainer';

interface FilterItemProps {
  name: string;
  facetName: OptionalFacetNames;
  selectedOptions?: SearchFilterStateSynced[];
}

const MultipleFilterItem: React.FC<FilterItemProps> = ({
  name,
  facetName,
  selectedOptions,
}) => (
  <Grid container>
    <Grid item xs={12}>
      <MultipleFilterItemAutocompleteContainer
        name={name}
        facetName={facetName}
      />
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
          key={option.entityId}
          facetName={facetName}
          filter={option}
        />
      ))}
    </Grid>
  </Grid>
);
export default MultipleFilterItem;
