import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getTermSearchFiltersSynced,
  getTermSearchId,
  getTermSearchIsCreating,
  getTermSearchIsFetching,
  getTermSearchResultsItems,
  getTermSearchResultsPage,
} from 'redux/selectors';
import { getTermSearchResults } from 'redux/thunks';
import TermSearchResults from './TermSearchResults';

const mapStateToProps = (state: RootState) => ({
  termSearchId: getTermSearchId(state),
  termSearchResults: getTermSearchResultsItems(state),
  pageInfo: getTermSearchResultsPage(state),
  termSearchFiltersSynced: getTermSearchFiltersSynced(state),
  isTermSearchFetching: getTermSearchIsFetching(state),
  isTermSearchCreating: getTermSearchIsCreating(state),
});

const mapDispatchToProps = {
  getTermSearchResults,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TermSearchResults);
