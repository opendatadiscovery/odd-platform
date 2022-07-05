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
  ActivitySingleQueryData,
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
  ) as ActivitySingleQueryData;

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

  const setDefaultValue = () => {
    if (filterName === 'datasourceId' || filterName === 'namespaceId') {
      const newFilterOptions = filterOptions as Array<
        DataSource | Namespace
      >;
      return (
        newFilterOptions.find(el => el.id === selectedOption)?.name ||
        'All'
      );
    }

    if (filterName === 'eventType') {
      const newFilterOptions = filterOptions as Array<ActivityEventType>;
      const option = newFilterOptions.find(el => el === selectedOption);

      return option || 'All';
    }

    return 'All';
  };

  return filterOptions.length ? (
    <Grid container>
      <Grid container item xs={12}>
        <AppTextField
          defaultValue={setDefaultValue()}
          sx={{ mt: 2 }}
          label={name}
          select
          id={`filter-${filterName}`}
          value={setDefaultValue()}
          onChange={e => console.log(e.target.value)}
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
