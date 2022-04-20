import { connect } from 'react-redux';
import { RootState, TermSearchOptionalFacetNames } from 'redux/interfaces';
import MultipleFilterItem from 'components/TermSearch/TermSearchFilters/TermsSearchFilterItem/MultipleFilterItem/MultipleFilterItem';
import * as actions from 'redux/actions';
import {
  getSelectedTermSearchSearchFacetOptions,
  getTermSearchFacetsByType,
  getTermSearchId,
} from 'redux/selectors/termSearch.selectors';
import { getTermSearchFacetOptions } from 'redux/thunks';

const mapStateToProps = (
  state: RootState,
  { facetName }: { facetName: TermSearchOptionalFacetNames }
) => ({
  searchId: getTermSearchId(state),
  facetOptionsAll: getTermSearchFacetsByType(state, facetName),
  selectedOptions: getSelectedTermSearchSearchFacetOptions(
    state,
    facetName
  ),
});

const mapDispatchToProps = {
  setFacets: actions.changeTermSearchFilterAction,
  searchFacetOptions: getTermSearchFacetOptions,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultipleFilterItem);
