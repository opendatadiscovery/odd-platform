import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getDataSourcesList,
  getDataSourcesListPage,
  getIsDatasourceCreating,
  getIsDatasourceDeleting,
  getIsDataSourcesListFetching,
} from 'redux/selectors/datasources.selectors';
import { fetchDataSourcesList } from 'redux/thunks/datasources.thunks';
import DataSourcesListView from './DataSourcesList';
import { styles } from './DataSourcesListStyles';

const mapStateToProps = (state: RootState) => ({
  dataSourcesList: getDataSourcesList(state),
  isCreating: getIsDatasourceCreating(state),
  isDeleting: getIsDatasourceDeleting(state),
  pageInfo: getDataSourcesListPage(state),
  isDataSourcesListFetching: getIsDataSourcesListFetching(state),
});

const mapDispatchToProps = {
  fetchDataSourcesList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DataSourcesListView));
