import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getSearchEntityType } from 'redux/selectors/dataentitySearch.selectors';
import { getDataSourcesList } from 'redux/selectors/datasources.selectors';
import { fetchDataSourcesList } from 'redux/thunks/datasources.thunks';
import { getNamespaceList } from 'redux/selectors/namespace.selectors';
import { fetchNamespaceList } from 'redux/thunks/namespace.thunks';
import Filters from './Filters';
import { styles } from './FiltersStyles';

const mapStateToProps = (state: RootState) => ({
  searchType: getSearchEntityType(state),
  datasources: getDataSourcesList(state),
  namespaces: getNamespaceList(state),
});

const mapDispatchToProps = {
  fetchDataSourcesList,
  fetchNamespaceList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Filters));
