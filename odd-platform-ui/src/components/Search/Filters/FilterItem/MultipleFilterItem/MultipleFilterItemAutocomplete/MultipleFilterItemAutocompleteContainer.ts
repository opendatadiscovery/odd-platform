import { connect } from 'react-redux';
import { getFacetOptions } from 'redux/thunks';
import * as actions from 'redux/actions';
import { OptionalFacetNames, RootState } from 'redux/interfaces';
import {
  getSearchFacetsByType,
  getSearchId,
} from 'redux/selectors/dataentitySearch.selectors';
import MultipleFilterItemAutocomplete from './MultipleFilterItemAutocomplete';

const mapStateToProps = (
  state: RootState,
  { facetName }: { facetName: OptionalFacetNames }
) => ({
  searchId: getSearchId(state),
  facetOptionsAll: getSearchFacetsByType(state, facetName),
});

const mapDispatchToProps = {
  setFacets: actions.changeDataEntitySearchFilterAction,
  searchFacetOptions: getFacetOptions,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultipleFilterItemAutocomplete);
