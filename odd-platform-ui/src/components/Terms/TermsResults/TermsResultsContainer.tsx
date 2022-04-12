import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getTermsSearchResults } from 'redux/thunks/terms.thunks';
import {
  getTermSearchFiltersSynced,
  getTermSearchId,
  getTermSearchIsCreating,
  getTermSearchIsFetching,
  getTermSearchResults,
  getTermSearchResultsPage,
} from 'redux/selectors/termsSearch.selectors';
import TermsResults from './TermsResults';

const mapStateToProps = (state: RootState) => ({
  searchId: getTermSearchId(state),
  searchResults: getTermSearchResults(state),
  pageInfo: getTermSearchResultsPage(state),
  searchFiltersSynced: getTermSearchFiltersSynced(state),
  isSearchFetching: getTermSearchIsFetching(state),
  isSearchCreating: getTermSearchIsCreating(state),
});

const mapDispatchToProps = {
  getTermsSearchResults,
};

export default connect(mapStateToProps, mapDispatchToProps)(TermsResults);
