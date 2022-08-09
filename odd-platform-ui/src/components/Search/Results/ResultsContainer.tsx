import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchEntityClass,
  getSearchFiltersSynced,
  getSearchId,
  getSearchIsCreating,
  getSearchIsCreatingAndFetching,
  getSearchIsFetching,
  getSearchIsUpdated,
  getSearchResults,
  getSearchResultsPage,
  getSearchTotals,
} from 'redux/selectors/dataentitySearch.selectors';
import { getDataEntityClassesDict } from 'redux/selectors/dataentity.selectors';
import Results from './Results';

const mapStateToProps = (state: RootState) => ({
  searchId: getSearchId(state),
  searchClass: getSearchEntityClass(state),
  dataEntityClassesDict: getDataEntityClassesDict(state),
  totals: getSearchTotals(state),
  searchResults: getSearchResults(state),
  pageInfo: getSearchResultsPage(state),
  searchFiltersSynced: getSearchFiltersSynced(state),
  isSearchFetching: getSearchIsFetching(state),
  isSearchCreatingAndFetching: getSearchIsCreatingAndFetching(state),
  isSearchUpdated: getSearchIsUpdated(state),
  isSearchCreating: getSearchIsCreating(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Results);
