import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchSuggestions,
  getSearchSuggestionsIsFetching as getEntitiesSuggestionsIsFetching,
} from 'redux/selectors/dataentitySearch.selectors';
import { fetchSearchSuggestions as fetchEntitiesSuggestions } from 'redux/thunks';
import EntitiesSuggestionsAutocomplete from './EntitiesSuggestionsAutocomplete';

const mapStateToProps = (state: RootState) => ({
  entitiesSuggestions: getSearchSuggestions(state),
  isEntitiesSuggestionsLoading: getEntitiesSuggestionsIsFetching(state),
});

const mapDispatchToProps = {
  fetchEntitiesSuggestions,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EntitiesSuggestionsAutocomplete);
