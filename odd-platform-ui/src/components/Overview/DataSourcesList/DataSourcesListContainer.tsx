import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getDataSourcesList } from 'redux/selectors/datasources.selectors';
import { fetchDataSourcesList } from 'redux/thunks/datasources.thunks';
import { createDataEntitiesSearch } from 'redux/thunks/dataentitiesSearch.thunks';
import DataSourcesList from './DataSourcesList';
import { styles } from './DataSourcesListStyles';

const mapStateToProps = (state: RootState) => ({
  dataSourceList: getDataSourcesList(state),
});

const mapDispatchToProps = {
  fetchDataSourcesList,
  createDataEntitiesSearch,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DataSourcesList));
