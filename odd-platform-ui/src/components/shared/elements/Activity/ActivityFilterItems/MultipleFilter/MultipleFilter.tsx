import React from 'react';
import { Grid } from '@mui/material';
import { useAppDispatch } from 'redux/lib/hooks';
import type { Owner, Tag } from 'generated-sources';
import { fetchOwnersList, fetchTagsList } from 'redux/thunks';
import { useQueryParams } from 'lib/hooks';
import {
  type ActivityMultipleFilterNames,
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import SelectedFilterOption from './SelectedFilterOption/SelectedFilterOption';
import MultipleFilterAutocomplete from './MultipleFilterAutocomplete/MultipleFilterAutocomplete';

interface MultipleFilterProps {
  name: string;
  dataQA?: string;
  filterName: ActivityMultipleFilterNames;
}

const MultipleFilter: React.FC<MultipleFilterProps> = ({ name, filterName, dataQA }) => {
  const dispatch = useAppDispatch();
  const { queryParams } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const [selectedOptions, setSelectedOptions] = React.useState<Array<Tag | Owner>>([]);

  React.useEffect(() => {
    const selectedOptionIds = queryParams[filterName] ?? [];
    const params = { page: 1, size: 100, ids: selectedOptionIds };

    if (selectedOptionIds.length > 0) {
      (filterName === 'tagIds'
        ? dispatch(fetchTagsList(params))
        : dispatch(fetchOwnersList(params))
      )
        .unwrap()
        .then(({ items }) => setSelectedOptions(items));
    } else {
      setSelectedOptions([]);
    }
  }, [filterName, queryParams]);

  return (
    <Grid container data-qa={dataQA}>
      <Grid item xs={12}>
        <MultipleFilterAutocomplete name={name} filterName={filterName} />
      </Grid>
      <Grid display='inline-flex' item xs={12} sx={{ my: 0.25, mx: -0.25 }} container>
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
