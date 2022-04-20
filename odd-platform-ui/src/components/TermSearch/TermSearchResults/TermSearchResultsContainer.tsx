import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getTermSearchFiltersSynced,
  getTermSearchId,
  getTermSearchIsCreating,
  getTermSearchIsFetching,
  getTermSearchResultsItems,
  getTermSearchResultsPage,
} from 'redux/selectors/termSearch.selectors';
import TermSearchResults from './TermSearchResults';
import { getTermSearchResults } from '../../../redux/thunks';

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
