import { connect } from 'react-redux';
import { getTermSearchFacetOptions } from 'redux/thunks';
import * as actions from 'redux/actions';
import {
  getTermSearchFacetsByType,
  getTermSearchId,
} from 'redux/selectors/termSearch.selectors';
import { RootState, TermSearchOptionalFacetNames } from 'redux/interfaces';
import MultipleFilterItemAutocomplete from './MultipleFilterItemAutocomplete';

const mapStateToProps = (
  state: RootState,
  { facetName }: { facetName: TermSearchOptionalFacetNames }
) => ({
  searchId: getTermSearchId(state),
  facetOptionsAll: getTermSearchFacetsByType(state, facetName),
});

const mapDispatchToProps = {
  setFacets: actions.changeTermSearchFilterAction,
  searchFacetOptions: getTermSearchFacetOptions,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultipleFilterItemAutocomplete);
