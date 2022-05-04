import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  createTermSearch,
  fetchTermSearchSuggestions,
} from 'redux/thunks';
import {
  getTermSearchQuery,
  getTermSearchSuggestions,
} from 'redux/selectors/termSearch.selectors';
import TermMainSearch from 'components/TermSearch/TermMainSearch/TermMainSearch';

const mapStateToProps = (state: RootState) => ({
  query: getTermSearchQuery(state),
  suggestions: getTermSearchSuggestions(state),
});

const mapDispatchToProps = {
  createTermSearch,
  fetchTermSearchSuggestions,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TermMainSearch);
