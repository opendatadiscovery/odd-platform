import React from 'react';
import { Grid } from '@mui/material';
import {
  ActivityEventType,
  DataSource,
  Namespace,
} from 'generated-sources';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { setSingleActivityFilter } from 'redux/reducers/activity.slice';
import { stringFormatted } from 'lib/helpers';
import {
  ActivitySingleFilterName,
  ActivitySingleFilterOption,
} from 'redux/interfaces';
import { getActivitiesSelectedSingleFilterByFilterName } from 'redux/selectors';

interface SingleFilterProps {
  name: string;
  filterOptions: DataSource[] | Namespace[] | ActivityEventType[];
  filterName: ActivitySingleFilterName;
}

const SingleFilter: React.FC<SingleFilterProps> = ({
  name,
  filterOptions,
  filterName,
}) => {
  const dispatch = useAppDispatch();

  const selectedOption = useAppSelector(state =>
    getActivitiesSelectedSingleFilterByFilterName(state, filterName)
  );

  const handleFilterSelect = (
    option: ActivitySingleFilterOption | string
  ) => {
    if (typeof option === 'string') {
      dispatch(
        setSingleActivityFilter({
          filterName,
          data: option as ActivityEventType,
        })
      );
    }

    if (typeof option !== 'string' && 'id' in option) {
      dispatch(setSingleActivityFilter({ filterName, data: option.id }));
    }
  };

  const optionsList = React.useMemo(
    () =>
      filterOptions?.map(option => {
        if (typeof option === 'string') {
          return (
            <AppMenuItem
              key={option}
              value={option}
              onClick={() => handleFilterSelect(option)}
              maxWidth={190}
            >
              {stringFormatted(option, '_', 'firstLetterOfEveryWord')}
            </AppMenuItem>
          );
        }

        return (
          <AppMenuItem
            key={option.id}
            value={option.name}
            onClick={() => handleFilterSelect(option)}
            maxWidth={190}
          >
            {option.name}
          </AppMenuItem>
        );
      }),
    [filterOptions]
  );

  const [selectValue, setSelectValue] = React.useState<string>('All');

  React.useEffect(() => {
    if (!selectedOption) setSelectValue('All');
  }, [selectedOption, setSelectValue]);

  return filterOptions.length ? (
    <Grid container>
      <Grid container item xs={12}>
        <AppTextField
          sx={{ mt: 2 }}
          label={name}
          select
          id={`filter-${filterName}`}
          value={selectValue}
          onChange={e => setSelectValue(e.target.value)}
        >
          <AppMenuItem
            value="All"
            maxWidth={190}
            onClick={() => handleFilterSelect({ id: 'All', name: 'All' })}
          >
            All
          </AppMenuItem>
          {optionsList}
        </AppTextField>
      </Grid>
    </Grid>
  ) : null;
};

export default SingleFilter;
