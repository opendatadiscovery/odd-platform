import React from 'react';
import { Grid } from '@mui/material';
import {
  ActivityEventType,
  DataSource,
  Namespace,
} from 'generated-sources';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import {
  useAppDispatch,
  useAppSelector,
  useUpdateActivityQuery,
} from 'lib/redux/hooks';
import { stringFormatted } from 'lib/helpers';
import {
  ActivitySingleFilterOption,
  ActivitySingleQueryName,
} from 'redux/interfaces';
import { getActivitiesQueryParamsByQueryName } from 'redux/selectors';

interface SingleFilterProps {
  name: string;
  filterOptions: DataSource[] | Namespace[] | ActivityEventType[];
  filterName: ActivitySingleQueryName;
}

const SingleFilter: React.FC<SingleFilterProps> = ({
  name,
  filterOptions,
  filterName,
}) => {
  const dispatch = useAppDispatch();

  const selectedOption = useAppSelector(state =>
    getActivitiesQueryParamsByQueryName(state, filterName)
  );

  const handleFilterSelect = (
    option: ActivitySingleFilterOption | string
  ) => {
    // useUpdateActivityQuery(filterName, option, "add");
    if (typeof option === 'string') {
      useUpdateActivityQuery(
        filterName,
        option as ActivityEventType,
        'add',
        dispatch
      );
      // dispatch(
      //   setSingleActivityFilter({
      //     filterName,
      //     data: option as ActivityEventType,
      //   })
      // );
    }

    if (typeof option !== 'string' && 'id' in option) {
      if (typeof option.id === 'number') {
        useUpdateActivityQuery(filterName, option.id, 'add', dispatch);
      }
      if (option.id === 'All') {
        useUpdateActivityQuery(filterName, null, 'add', dispatch);
      }
      // dispatch(setSingleActivityFilter({ filterName, data: option.id }));
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
