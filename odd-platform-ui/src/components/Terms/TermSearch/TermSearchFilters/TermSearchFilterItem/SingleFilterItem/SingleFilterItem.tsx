import React from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SearchFilter } from 'generated-sources';
import { AppMenuItem, AppSelect } from 'components/shared/elements';
import type { TermSearchOptionalFacetNames } from 'redux/interfaces';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getSelectedTermSearchFacetOptions } from 'redux/selectors';
import { changeTermSearchFacet } from 'redux/slices/termSearch.slice';

interface FilterItemProps {
  name: string;
  facetName: TermSearchOptionalFacetNames;
  facetOptions: SearchFilter[];
}

const SingleFilterItem: React.FC<FilterItemProps> = ({
  name,
  facetName,
  facetOptions,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selectedOptions = useAppSelector(getSelectedTermSearchFacetOptions(facetName));

  const handleFilterSelect = React.useCallback(
    (option: { id: number | string; name: string }) => {
      dispatch(
        changeTermSearchFacet({
          facetName,
          facetOptionId: option.id,
          facetOptionName: option.name,
          facetOptionState: true,
          facetSingle: true,
        })
      );
    },
    [changeTermSearchFacet, facetName]
  );

  return facetOptions.length ? (
    <Grid container>
      <Grid container item xs={12}>
        <AppSelect
          sx={{ mt: 2 }}
          label={name}
          id={`term-search-filter-${facetName}`}
          value={selectedOptions?.length ? selectedOptions[0].entityId : 'All'}
        >
          <AppMenuItem
            value='All'
            maxWidth={190}
            onClick={() => handleFilterSelect({ id: 'All', name: t('All') })}
          >
            {t('All')}
          </AppMenuItem>
          {facetOptions?.map(option => (
            <AppMenuItem
              key={option.id}
              value={option.id}
              onClick={() => handleFilterSelect(option)}
            >
              {option.name}
            </AppMenuItem>
          ))}
        </AppSelect>
      </Grid>
    </Grid>
  ) : null;
};

export default SingleFilterItem;
