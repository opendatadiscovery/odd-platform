import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchFacetsByType,
  getSearchId,
  getSelectedSearchFacetOptions,
} from 'redux/selectors/dataentitySearch.selectors';
import { OptionalFacetNames } from 'redux/interfaces/dataEntitySearch';
import MultipleFilterItem from 'components/Search/Filters/FilterItem/MultipleFilterItem/MultipleFilterItem';

const mapStateToProps = (
  state: RootState,
  { facetName }: { facetName: OptionalFacetNames }
) => ({
  searchId: getSearchId(state),
  facetOptionsAll: getSearchFacetsByType(state, facetName),
  selectedOptions: getSelectedSearchFacetOptions(state, facetName),
});

const mapDispatchToProps = {
  // setFacets: actions.changeDataEntitySearchFilterAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultipleFilterItem);
