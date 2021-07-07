import React, { useEffect } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import {
  DataSource,
  SearchFormData,
  DataSourceApiGetDataSourceListRequest,
  SearchApiSearchRequest,
  SearchFacetsData,
} from 'generated-sources';
import { searchPath } from 'lib/paths';
import { StylesType } from './DataSourcesListStyles';

interface DataSourcesListProps extends StylesType {
  dataSourceList: DataSource[];
  fetchDataSourcesList: (
    params: DataSourceApiGetDataSourceListRequest
  ) => void;
  createDataEntitiesSearch: (
    params: SearchApiSearchRequest
  ) => Promise<SearchFacetsData>;
}

const DataSourcesList: React.FC<DataSourcesListProps> = ({
  classes,
  dataSourceList,
  fetchDataSourcesList,
  createDataEntitiesSearch,
}) => {
  const history = useHistory();
  const [searchLoading, setSearchLoading] = React.useState<boolean>(false);

  useEffect(() => {
    fetchDataSourcesList({ page: 1, size: 5 });
  }, []);

  const handleDatasourceClick = (id: number) => () => {
    if (searchLoading) return;
    setSearchLoading(true);
    const searchQuery: SearchFormData = {
      query: '',
      filters: {
        datasources: [{ entityId: id, selected: true }],
      },
    };
    createDataEntitiesSearch({ searchFormData: searchQuery }).then(
      search => {
        const searchLink = searchPath(search.searchId);
        history.push(searchLink);
      }
    );
  };

  return (
    <Grid item className={classes.container}>
      <Typography variant="h4" className={classes.sectionCaption}>
        Data Sources
      </Typography>
      <ul className={classes.listLinks}>
        {dataSourceList.slice(0, 5).map(item => (
          <li key={item.id} className={classes.listLink}>
            <Typography
              noWrap
              title={item.name}
              onClick={handleDatasourceClick(item.id)}
            >
              {item.name}
            </Typography>
          </li>
        ))}
      </ul>
    </Grid>
  );
};

export default DataSourcesList;
