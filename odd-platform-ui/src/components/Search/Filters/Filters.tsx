import React from 'react';
import { Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import * as actions from 'redux/actions';
import {
  DataSource,
  DataSourceList,
  DataSourceApiGetDataSourceListRequest,
} from 'generated-sources';
import AppButton from 'components/shared/AppButton/AppButton';
import MultipleFilterItemContainer from 'components/Search/Filters/FilterItem/MultipleFilterItem/MultipleFilterItemContainer';
import SingleFilterItemContainer from 'components/Search/Filters/FilterItem/SingleFilterItem/SingleFilterItemContainer';
import { StylesType } from './FiltersStyles';

interface FiltersProps extends StylesType {
  searchType?: number;
  datasources: DataSource[];
  fetchDataSourcesList: (
    params: DataSourceApiGetDataSourceListRequest
  ) => Promise<DataSourceList>;
}

const Filters: React.FC<FiltersProps> = ({
  classes,
  searchType,
  datasources,
  fetchDataSourcesList,
}) => {
  const dispatch = useDispatch();

  const onClear = () => {
    dispatch(actions.clearDataEntitySearchFiltersAction());
  };

  React.useEffect(() => {
    fetchDataSourcesList({ page: 1, size: 100 });
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.caption}>
        <Typography variant="h4">Filters</Typography>
        <AppButton color="tertiary" size="medium" onClick={onClear}>
          Clear All
        </AppButton>
      </div>
      <div className={classes.listContainer}>
        <SingleFilterItemContainer
          key="ds"
          facetName="datasources"
          name="Datasource"
          facetOptions={datasources}
          // fetchOptions={fetchDataSourcesList}
        />
        {searchType && searchType > 0 ? (
          <MultipleFilterItemContainer
            key="st"
            facetName="subtypes"
            name="Type"
          />
        ) : null}
        <SingleFilterItemContainer
          key="ns"
          facetName="namespaces"
          name="Namespace"
          facetOptions={[]}
        />
        <MultipleFilterItemContainer
          key="ow"
          facetName="owners"
          name="Owner"
        />
        <MultipleFilterItemContainer
          key="tg"
          facetName="tags"
          name="Tag"
        />
      </div>
    </div>
  );
};

export default Filters;
