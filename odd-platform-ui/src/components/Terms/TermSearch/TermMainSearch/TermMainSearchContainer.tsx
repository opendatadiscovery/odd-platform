import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  createTermSearch,
  fetchTermSearchSuggestions,
} from 'redux/thunks';
import {
  getTermSearchQuery,
  getTermSearchSuggestions,
  getTermSuggestionsIsFetching,
} from 'redux/selectors/termSearch.selectors';
import TermMainSearch from './TermMainSearch';

const mapStateToProps = (state: RootState) => ({
  query: getTermSearchQuery(state),
  suggestions: getTermSearchSuggestions(state),
  isSuggestionsFetching: getTermSuggestionsIsFetching(state),
});

const mapDispatchToProps = {
  createTermSearch,
  fetchTermSearchSuggestions,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TermMainSearch);
