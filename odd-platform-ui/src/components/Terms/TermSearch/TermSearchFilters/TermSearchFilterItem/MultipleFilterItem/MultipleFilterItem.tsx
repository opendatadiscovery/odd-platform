import React from 'react';
import { Grid } from '@mui/material';
import { SearchFilterStateSynced } from 'redux/interfaces/dataEntitySearch';
import { TermSearchOptionalFacetNames } from 'redux/interfaces/termSearch';
import SelectedFilterOption from './SelectedFilterOption/SelectedFilterOption';
import MultipleFilterItemAutocompleteContainer from './MultipleFilterItemAutocomplete/MultipleFilterItemAutocompleteContainer';

interface FilterItemProps {
  name: string;
  facetName: TermSearchOptionalFacetNames;
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
