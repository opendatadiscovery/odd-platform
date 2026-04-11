import React from 'react';
import { Grid } from '@mui/material';
import type { OptionalFacetNames } from 'redux/interfaces';
import { useAppSelector } from 'redux/lib/hooks';
import { getSelectedSearchFacetOptions } from 'redux/selectors';
import SelectedFilterOption from '../SelectedFilterOption/SelectedFilterOption';
import MultipleFilterItemAutocomplete from './MultipleFilterItemAutocomplete/MultipleFilterItemAutocomplete';

interface FilterItemProps {
  name: string;
  facetName: OptionalFacetNames;
}

const MultipleFilterItem: React.FC<FilterItemProps> = ({ name, facetName }) => {
  const selectedOptions = useAppSelector(getSelectedSearchFacetOptions(facetName));

  return (
    <Grid container>
      <Grid item xs={12}>
        <MultipleFilterItemAutocomplete name={name} facetName={facetName} />
      </Grid>
      <Grid display='inline-flex' item xs={12} sx={{ my: 0.25, mx: -0.25 }} container>
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
};

export default MultipleFilterItem;
