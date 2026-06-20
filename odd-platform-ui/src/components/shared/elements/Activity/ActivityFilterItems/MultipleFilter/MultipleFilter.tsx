import React from 'react';
import { Grid } from '@mui/material';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchOwnersList, fetchTagsList } from 'redux/thunks';
import { useQueryParams } from 'lib/hooks';
import { type ActivityFilterOption } from 'components/shared/elements/Activity/common';
import SelectedFilterOption from './SelectedFilterOption/SelectedFilterOption';
import MultipleFilterAutocomplete from './MultipleFilterAutocomplete/MultipleFilterAutocomplete';

// Shared multi-select filter. Generic over the page's query shape so both the Activity surface
// (tagIds / ownerIds / userIds / usernames) and the Alerts surface (tagIds / ownerIds) drive it from
// their own default query. `filterName` is the URL/query key the chips read & write.
interface MultipleFilterProps<Q extends object> {
  name: string;
  dataQA?: string;
  filterName: keyof Q & string;
  defaultQuery: Q;
  // Optional inline affordance rendered next to the field label (e.g. an InformationHint).
  hint?: React.ReactNode;
}

const MultipleFilter = <Q extends object>({
  name,
  filterName,
  defaultQuery,
  dataQA,
  hint,
}: MultipleFilterProps<Q>) => {
  const dispatch = useAppDispatch();
  const { queryParams } = useQueryParams<Q>(defaultQuery);

  const [selectedOptions, setSelectedOptions] = React.useState<ActivityFilterOption[]>(
    []
  );

  React.useEffect(() => {
    // The User filter (#1657) keys on usernames (strings) recorded on the activity rows; the chip
    // label IS the username, so there is no id->name lookup to perform (unlike tags/owners).
    if (filterName === 'usernames') {
      const usernames = ((queryParams as Record<string, unknown>).usernames ??
        []) as string[];
      setSelectedOptions(usernames.map(username => ({ id: username, name: username })));
      return;
    }

    const ids = ((queryParams as Record<string, unknown>)[filterName] ?? []) as number[];
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
        <MultipleFilterAutocomplete
          name={name}
          filterName={filterName}
          defaultQuery={defaultQuery}
          hint={hint}
        />
      </Grid>
      <Grid display='inline-flex' item xs={12} sx={{ my: 0.25, mx: -0.25 }} container>
        {selectedOptions &&
          selectedOptions?.length > 0 &&
          selectedOptions.map(option => (
            <SelectedFilterOption
              key={option.id}
              filterName={filterName}
              defaultQuery={defaultQuery}
              selectedOption={option}
            />
          ))}
      </Grid>
    </Grid>
  );
};
export default MultipleFilter;
