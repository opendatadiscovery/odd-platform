import { connect } from 'react-redux';
import { RootState, TermSearchOptionalFacetNames } from 'redux/interfaces';
import { getSelectedTermSearchFacetOptions } from 'redux/selectors/termSearch.selectors';
import * as actions from 'redux/actions';
import SingleFilterItem from './SingleFilterItem';

const mapStateToProps = (
  state: RootState,
  { facetName }: { facetName: TermSearchOptionalFacetNames }
) => ({
  selectedOptions: getSelectedTermSearchFacetOptions(state, facetName),
});

const mapDispatchToProps = {
  setFacets: actions.changeTermSearchFilterAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleFilterItem);
