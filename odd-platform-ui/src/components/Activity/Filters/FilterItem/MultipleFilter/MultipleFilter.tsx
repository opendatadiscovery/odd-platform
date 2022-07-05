import React from 'react';
import { Grid } from '@mui/material';
import {
  ActivityMultipleFilterOption,
  ActivityMultipleQueryName,
} from 'redux/interfaces';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { getActivitiesQueryParamsByQueryName } from 'redux/selectors';
import { Owner, Tag } from 'generated-sources';
import { fetchOwnersList, fetchTagsList } from 'redux/thunks';
import SelectedFilterOption from './SelectedFilterOption/SelectedFilterOption';
import MultipleFilterAutocomplete from './MultipleFilterAutocomplete/MultipleFilterAutocomplete';

interface MultipleFilterProps {
  name: string;
  filterName: ActivityMultipleQueryName;
}

const MultipleFilter: React.FC<MultipleFilterProps> = ({
  name,
  filterName,
}) => {
  const dispatch = useAppDispatch();

  const [selectedOptions, setSelectedOptions] = React.useState<
    Array<Tag | Owner> | undefined
  >(undefined);

  const selectedOptionIds = useAppSelector(state =>
    getActivitiesQueryParamsByQueryName(state, filterName)
  ) as Array<number>;

  const handleSetSelectedOptions = React.useCallback(
    (options: Array<ActivityMultipleFilterOption>) =>
      setSelectedOptions(options),
    [setSelectedOptions]
  );

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
          // selectedOptionIds={selectedOptionIds}
          // setSelectedOptions={handleSetSelectedOptions}
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
