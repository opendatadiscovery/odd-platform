import React, { type PropsWithChildren } from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { stringFormatted } from 'lib/helpers';
import { useQueryParams } from 'lib/hooks';
import AppSelect from 'components/shared/elements/AppSelect/AppSelect';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';

interface FilterOptionObject {
  id: number | string;
  name: string;
}

// Shared single-select filter. Generic over the page's query shape and the filter key so it serves
// both the Activity surface (datasource / namespace / eventType) and the Alerts surface (datasource /
// namespace / status). `filterOptions` are either reference objects ({id,name}) or raw enum strings;
// an optional `getOptionLabel` lets a caller localise enum labels (e.g. translated AlertStatus) while
// the default keeps the existing humanised-enum rendering for activity event types.
interface SingleFilterProps<Q extends object, Name extends keyof Q, OptionType> {
  name: string;
  filterOptions: OptionType[];
  filterName: Name;
  defaultQuery: Q;
  getOptionLabel?: (option: string) => string;
  dataQA?: string;
}

const SingleFilter = <
  Q extends object,
  Name extends keyof Q,
  OptionType extends FilterOptionObject | string,
>({
  name,
  filterOptions,
  filterName,
  defaultQuery,
  getOptionLabel,
  dataQA,
}: PropsWithChildren<SingleFilterProps<Q, Name, OptionType>>) => {
  const { t } = useTranslation();
  const defaultOption = 'All';
  const { setQueryParams, queryParams } = useQueryParams<Q>(defaultQuery);

  const handleFilterSelect = React.useCallback(
    (option: FilterOptionObject | string) => (_: React.MouseEvent<HTMLLIElement>) => {
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

  const renderOptionLabel = (option: string) =>
    getOptionLabel
      ? getOptionLabel(option)
      : stringFormatted(option, '_', 'firstLetterOfEveryWord');

  return (
    <Grid container>
      <Grid container item xs={12}>
        <AppSelect
          defaultValue={defaultOption}
          sx={{ mt: 2 }}
          label={name}
          id={`filter-${String(filterName)}`}
          value={(queryParams[filterName] as unknown as string) ?? defaultOption}
          dataQAId={dataQA}
        >
          <AppMenuItem value='All' onClick={handleFilterSelect(defaultOption)}>
            {t('All')}
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
                {renderOptionLabel(option)}
              </AppMenuItem>
            )
          )}
        </AppSelect>
      </Grid>
    </Grid>
  );
};

export default SingleFilter;
