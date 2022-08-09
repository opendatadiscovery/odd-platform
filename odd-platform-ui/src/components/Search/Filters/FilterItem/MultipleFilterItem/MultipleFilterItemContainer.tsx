import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchFacetsByType,
  getSearchId,
  getSelectedSearchFacetOptions,
} from 'redux/selectors/dataentitySearch.selectors';
import { OptionalFacetNames } from 'redux/interfaces/dataEntitySearch';
import MultipleFilterItem from 'components/Search/Filters/FilterItem/MultipleFilterItem/MultipleFilterItem';
import * as actions from 'redux/actions';
import { getFacetOptions } from 'redux/thunks/dataentitiesSearch.thunks';

const mapStateToProps = (
  state: RootState,
  { facetName }: { facetName: OptionalFacetNames }
) => ({
  searchId: getSearchId(state),
  facetOptionsAll: getSearchFacetsByType(state, facetName),
  selectedOptions: getSelectedSearchFacetOptions(state, facetName),
});

const mapDispatchToProps = {
  setFacets: actions.changeDataEntitySearchFilterAction,
  searchFacetOptions: getFacetOptions,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultipleFilterItem);
