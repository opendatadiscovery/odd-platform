import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchFiltersSynced,
  getSearchId,
  getSearchIsCreating,
  getSearchIsFetching,
  getSearchResults,
  getSearchResultsPage,
} from 'redux/selectors/dataentitySearch.selectors';
import { getDataEntitiesSearchResults } from 'redux/thunks/dataentitiesSearch.thunks';
import TermsResults from './TermsResults';

const mapStateToProps = (state: RootState) => ({
  searchId: getSearchId(state),
  searchResults: getSearchResults(state),
  pageInfo: getSearchResultsPage(state),
  searchFiltersSynced: getSearchFiltersSynced(state),
  isSearchFetching: getSearchIsFetching(state),
  isSearchCreating: getSearchIsCreating(state),
});

const mapDispatchToProps = {
  getDataEntitiesSearchResults,
};

export default connect(mapStateToProps, mapDispatchToProps)(TermsResults);
