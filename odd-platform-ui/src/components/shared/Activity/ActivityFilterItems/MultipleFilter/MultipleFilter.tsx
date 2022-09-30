import React from 'react';
import { Grid } from '@mui/material';
import { ActivityQueryName } from 'redux/interfaces';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getActivitiesQueryParamsByName } from 'redux/selectors';
import { Owner, Tag } from 'generated-sources';
import { fetchOwnersList, fetchTagsList } from 'redux/thunks';
import SelectedFilterOption from 'components/shared/Activity/ActivityFilterItems/MultipleFilter/SelectedFilterOption/SelectedFilterOption';
import MultipleFilterAutocomplete from 'components/shared/Activity/ActivityFilterItems/MultipleFilter/MultipleFilterAutocomplete/MultipleFilterAutocomplete';

interface MultipleFilterProps {
  name: string;
  filterName: ActivityQueryName;
}

const MultipleFilter: React.FC<MultipleFilterProps> = ({
  name,
  filterName,
}) => {
  const dispatch = useAppDispatch();

  const [selectedOptions, setSelectedOptions] = React.useState<
    Array<Tag | Owner> | undefined
  >(undefined);

  const selectedOptionIds = useAppSelector(
    getActivitiesQueryParamsByName(filterName)
  ) as Array<number>;

  React.useEffect(() => {
    if (selectedOptionIds?.length > 0) {
      (filterName === 'tagIds'
        ? dispatch(
            fetchTagsList({
              page: 1,
              size: 100,
              ids: selectedOptionIds,
            })
          )
        : dispatch(
            fetchOwnersList({
              page: 1,
              size: 100,
              ids: selectedOptionIds,
            })
          )
      )
        .unwrap()
        .then(({ items }) => setSelectedOptions(items));
    } else {
      setSelectedOptions([]);
    }
  }, [filterName, selectedOptionIds]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <MultipleFilterAutocomplete
          name={name}
          filterName={filterName}
          selectedOptionIds={selectedOptionIds}
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
