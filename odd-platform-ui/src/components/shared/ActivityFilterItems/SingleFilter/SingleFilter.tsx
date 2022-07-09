import React, { PropsWithChildren } from 'react';
import { Grid } from '@mui/material';
import {
  ActivityEventType,
  DataSource,
  Namespace,
} from 'generated-sources';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { stringFormatted } from 'lib/helpers';
import { ActivityFilterOption, ActivityQueryName } from 'redux/interfaces';
import { setActivityQueryParam } from 'redux/reducers/activity.slice';
import { getActivitiesQueryParamsByName } from 'redux/selectors';

interface SingleFilterProps<OptionType> {
  name: string;
  filterOptions: Array<OptionType>;
  filterName: ActivityQueryName;
}

const SingleFilter = <
  OptionType extends DataSource | Namespace | ActivityEventType
>({
  name,
  filterOptions,
  filterName,
}: PropsWithChildren<SingleFilterProps<OptionType>>) => {
  const dispatch = useAppDispatch();
  const dispatchQueryParam = (
    queryData: null | number | ActivityEventType
  ) =>
    dispatch(
      setActivityQueryParam({
        queryName: filterName,
        queryData,
      })
    );

  const selectedParam = useAppSelector(
    getActivitiesQueryParamsByName(filterName)
  );

  const [selectedOption, setSelectedOption] = React.useState('All');

  React.useEffect(() => {
    const option = filterOptions.find(el => {
      if (typeof el === 'string') {
        return el === selectedParam;
      }
      return el.id === selectedParam;
    });

    if (option) {
      if (typeof option === 'string') {
        setSelectedOption(option);
      } else {
        setSelectedOption(option.name);
      }
    } else {
      setSelectedOption('All');
    }
  }, [filterOptions, selectedParam]);

  const handleFilterSelect = (option: ActivityFilterOption | string) => {
    if (option === 'All') {
      dispatchQueryParam(null);
      return;
    }

    if (typeof option === 'string') {
      dispatchQueryParam(option as ActivityEventType);
    } else {
      dispatchQueryParam(option.id);
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

  return filterOptions.length ? (
    <Grid container>
      <Grid container item xs={12}>
        <AppTextField
          defaultValue="All"
          sx={{ mt: 2 }}
          label={name}
          select
          id={`filter-${filterName}`}
          value={selectedOption}
        >
          <AppMenuItem
            value="All"
            maxWidth={190}
            onClick={() => handleFilterSelect('All')}
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
