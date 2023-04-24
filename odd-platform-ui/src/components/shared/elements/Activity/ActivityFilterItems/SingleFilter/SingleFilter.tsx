import React, { type PropsWithChildren } from 'react';
import { Grid } from '@mui/material';
import type { ActivityEventType, DataSource, Namespace } from 'generated-sources';
import { stringFormatted } from 'lib/helpers';
import { useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  type ActivitySingleFilterNames,
  type ActivityFilterOption,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import AppSelect from 'components/shared/elements/AppSelect/AppSelect';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';

interface SingleFilterProps<OptionType> {
  name: string;
  filterOptions: Array<OptionType>;
  filterName: ActivitySingleFilterNames;
  dataQA?: string;
}

const SingleFilter = <OptionType extends DataSource | Namespace | ActivityEventType>({
  name,
  filterOptions,
  filterName,
  dataQA,
}: PropsWithChildren<SingleFilterProps<OptionType>>) => {
  const defaultOption = 'All';
  const { setQueryParams, queryParams } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);

  const handleFilterSelect = React.useCallback(
    (option: ActivityFilterOption | string) => (_: React.MouseEvent<HTMLLIElement>) => {
      if (option === defaultOption) {
        setQueryParams(prev => ({ ...prev, [filterName]: null }));
        return;
      }

      if (typeof option === 'string') {
        setQueryParams(prev => ({ ...prev, [filterName]: option }));
      } else {
        setQueryParams(prev => ({ ...prev, [filterName]: option.id }));
      }
    },
    [setQueryParams, filterName]
  );

  return (
    <Grid container>
      <Grid container item xs={12}>
        <AppSelect
          defaultValue={defaultOption}
          sx={{ mt: 2 }}
          label={name}
          id={`filter-${filterName}`}
          value={queryParams[filterName] || defaultOption}
          dataQAId={dataQA}
        >
          <AppMenuItem value='All' onClick={handleFilterSelect(defaultOption)}>
            All
          </AppMenuItem>
          {filterOptions.map(option =>
            typeof option === 'object' ? (
              <AppMenuItem
                key={option.id}
                value={option.id}
                onClick={handleFilterSelect(option)}
              >
                {option.name}
              </AppMenuItem>
            ) : (
              <AppMenuItem
                key={option}
                value={option}
                onClick={handleFilterSelect(option)}
              >
                {stringFormatted(option, '_', 'firstLetterOfEveryWord')}
              </AppMenuItem>
            )
          )}
        </AppSelect>
      </Grid>
    </Grid>
  );
};

export default SingleFilter;
