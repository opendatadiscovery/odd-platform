import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchEntityType,
  getSearchIsUpdated,
} from 'redux/selectors/dataentitySearch.selectors';
import {
  getDataSourcesList,
  getIsDataSourcesListFetching,
} from 'redux/selectors/datasources.selectors';
import { fetchDataSourcesList } from 'redux/thunks/datasources.thunks';
import { getNamespaceList } from 'redux/selectors/namespace.selectors';
import { fetchNamespaceList } from 'redux/thunks/namespace.thunks';
import * as actions from 'redux/actions';
import Filters from './Filters';

const mapStateToProps = (state: RootState) => ({
  searchType: getSearchEntityType(state),
  datasources: getDataSourcesList(state),
  namespaces: getNamespaceList(state),
  isSearchFacetsUpdating: getSearchIsUpdated(state),
  isDatasourceListFetching: getIsDataSourcesListFetching(state),
});

const mapDispatchToProps = {
  fetchDataSourcesList,
  fetchNamespaceList,
  clearDataEntitySearchFilters: actions.clearDataEntitySearchFiltersAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
