import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getSelectedSearchFacetOptions } from 'redux/selectors/dataentitySearch.selectors';
import { OptionalFacetNames } from 'redux/interfaces/search';
import * as actions from 'redux/actions';
import SingleFilterItem from './SingleFilterItem';

const mapStateToProps = (
  state: RootState,
  { facetName }: { facetName: OptionalFacetNames }
) => ({
  selectedOptions: getSelectedSearchFacetOptions(state, facetName),
});

const mapDispatchToProps = {
  setFacets: actions.changeDataEntitySearchFilterAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleFilterItem);
