import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getSearchEntityClass } from 'redux/selectors/dataentitySearch.selectors';
import { getNamespaceList } from 'redux/selectors/namespace.selectors';
import { fetchNamespaceList } from 'redux/thunks/namespace.thunks';
import Filters from './Filters';

const mapStateToProps = (state: RootState) => ({
  searchClass: getSearchEntityClass(state),
  namespaces: getNamespaceList(state),
  // isSearchFacetsUpdating: getSearchIsUpdated(state),
});

const mapDispatchToProps = {
  fetchNamespaceList,
  // clearDataEntitySearchFilters: actions.clearDataEntitySearchFiltersAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
