import React from 'react';
import { Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import * as actions from 'redux/actions';
import {
  DataSource,
  DataSourceList,
  DataSourceApiGetDataSourceListRequest,
  NamespaceApiGetNamespaceListRequest,
  Namespace,
} from 'generated-sources';
import { SearchType } from 'redux/interfaces/search';
import AppButton from 'components/shared/AppButton/AppButton';
import MultipleFilterItemContainer from 'components/Search/Filters/FilterItem/MultipleFilterItem/MultipleFilterItemContainer';
import SingleFilterItemContainer from 'components/Search/Filters/FilterItem/SingleFilterItem/SingleFilterItemContainer';
import { StylesType } from './FiltersStyles';

interface FiltersProps extends StylesType {
  searchType?: SearchType;
  datasources: DataSource[];
  namespaces: Namespace[];
  fetchDataSourcesList: (
    params: DataSourceApiGetDataSourceListRequest
  ) => Promise<DataSourceList>;
  fetchNamespaceList: (params: NamespaceApiGetNamespaceListRequest) => void;
}

const Filters: React.FC<FiltersProps> = ({
  classes,
  searchType,
  datasources,
  namespaces,
  fetchDataSourcesList,
  fetchNamespaceList,
}) => {
  const dispatch = useDispatch();

  const onClear = () => {
    dispatch(actions.clearDataEntitySearchFiltersAction());
  };

  React.useEffect(() => {
    fetchDataSourcesList({ page: 1, size: 100 });
    fetchNamespaceList({ page: 1, size: 100 });
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
          facetOptions={namespaces}
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
