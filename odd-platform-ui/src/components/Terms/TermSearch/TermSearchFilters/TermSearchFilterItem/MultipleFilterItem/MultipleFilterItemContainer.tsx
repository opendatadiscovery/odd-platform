import { connect } from 'react-redux';
import { RootState, TermSearchOptionalFacetNames } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { getTermSearchFacetOptions } from 'redux/thunks/termSearch.thunks';
import {
  getSelectedTermSearchFacetOptions,
  getTermSearchFacetsByType,
  getTermSearchId,
} from 'redux/selectors/termSearch.selectors';
import MultipleFilterItem from './MultipleFilterItem';

const mapStateToProps = (
  state: RootState,
  { facetName }: { facetName: TermSearchOptionalFacetNames }
) => ({
  searchId: getTermSearchId(state),
  facetOptionsAll: getTermSearchFacetsByType(state, facetName),
  selectedOptions: getSelectedTermSearchFacetOptions(state, facetName),
});

const mapDispatchToProps = {
  setFacets: actions.changeTermSearchFilterAction,
  searchFacetOptions: getTermSearchFacetOptions,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultipleFilterItem);
