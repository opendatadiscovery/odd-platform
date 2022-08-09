import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchQuery,
  getSearchSuggestions,
} from 'redux/selectors/dataentitySearch.selectors';
import MainSearch from 'components/shared/MainSearch/MainSearch';

const mapStateToProps = (state: RootState) => ({
  query: getSearchQuery(state),
  suggestions: getSearchSuggestions(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(MainSearch);
