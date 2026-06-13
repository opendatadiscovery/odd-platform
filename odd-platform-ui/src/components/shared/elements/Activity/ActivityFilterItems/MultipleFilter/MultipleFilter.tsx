import React from 'react';
import { Grid } from '@mui/material';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchOwnersList, fetchTagsList } from 'redux/thunks';
import { useQueryParams } from 'lib/hooks';
import {
  type ActivityFilterOption,
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
  // Optional inline affordance rendered next to the field label (e.g. an InformationHint).
  hint?: React.ReactNode;
}

const MultipleFilter: React.FC<MultipleFilterProps> = ({ name, filterName, dataQA, hint }) => {
  const dispatch = useAppDispatch();
  const { queryParams } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const [selectedOptions, setSelectedOptions] = React.useState<ActivityFilterOption[]>([]);

  React.useEffect(() => {
    // The User filter (#1657) keys on usernames (strings) recorded on the activity rows; the chip
    // label IS the username, so there is no id->name lookup to perform (unlike tags/owners).
    if (filterName === 'usernames') {
      const usernames = (queryParams.usernames ?? []) as string[];
      setSelectedOptions(usernames.map(username => ({ id: username, name: username })));
      return;
    }

    const ids = (queryParams[filterName] ?? []) as number[];
    if (ids.length === 0) {
      setSelectedOptions([]);
      return;
    }
    (filterName === 'tagIds'
      ? dispatch(fetchTagsList({ page: 1, size: 100, ids }))
      : dispatch(fetchOwnersList({ page: 1, size: 100, ids }))
    )
      .unwrap()
      .then(({ items }) => setSelectedOptions(items));
  }, [filterName, queryParams, dispatch]);

  return (
    <Grid container data-qa={dataQA}>
      <Grid item xs={12}>
        <MultipleFilterAutocomplete name={name} filterName={filterName} hint={hint} />
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
