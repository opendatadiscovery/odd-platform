import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import { useDataQualityContext } from 'components/DataQuality/DataQualityContext/DataQualityContext';
import SelectedFilterOption from './SelectedFilterOption/SelectedFilterOption';
import MultipleFilterItemAutocomplete from './MultipleFilterItemAutocomplete/MultipleFilterItemAutocomplete';
import type { Hook, FilterOption } from '../interfaces';

interface Props {
  name: string;
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest;
  useHook: Hook;
}

const MultipleFilterItem: React.FC<Props> = ({ name, useHook, filterKey }) => {
  const { updateFilter } = useDataQualityContext();
  const [selectedOptions, setSelectedOptions] = useState<FilterOption[]>([]);

  useEffect(() => {
    const updatedFilterValue = selectedOptions.map(option => option.id);
    updateFilter(filterKey, updatedFilterValue);
  }, [selectedOptions]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <MultipleFilterItemAutocomplete
          name={name}
          useHook={useHook}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />
      </Grid>
      <Grid display='inline-flex' item xs={12} sx={{ my: 0.25, mx: -0.25 }} container>
        {selectedOptions?.map(option => (
          <SelectedFilterOption
            key={option.id}
            selectedOption={option}
            setSelectedOptions={setSelectedOptions}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default MultipleFilterItem;
