import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getNamespaceList } from 'redux/selectors/namespace.selectors';
import { getTermSearchIsUpdated } from 'redux/selectors/termSearch.selectors';
import { fetchNamespaceList } from 'redux/thunks/namespace.thunks';
import * as actions from 'redux/actions';
import TermSearchFilters from 'components/Terms/TermSearch/TermSearchFilters/TermSearchFilters';

const mapStateToProps = (state: RootState) => ({
  namespaces: getNamespaceList(state),
  isTermSearchFacetsUpdating: getTermSearchIsUpdated(state),
});

const mapDispatchToProps = {
  fetchNamespaceList,
  clearTermSearchFilters: actions.clearTermSearchFiltersAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TermSearchFilters);
