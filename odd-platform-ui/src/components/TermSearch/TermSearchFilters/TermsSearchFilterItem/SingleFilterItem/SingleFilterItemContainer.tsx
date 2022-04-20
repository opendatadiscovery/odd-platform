import { connect } from 'react-redux';
import { RootState, TermSearchOptionalFacetNames } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { getSelectedTermSearchSearchFacetOptions } from 'redux/selectors/termSearch.selectors';
import SingleFilterItem from './SingleFilterItem';

const mapStateToProps = (
  state: RootState,
  { facetName }: { facetName: TermSearchOptionalFacetNames }
) => ({
  selectedOptions: getSelectedTermSearchSearchFacetOptions(
    state,
    facetName
  ),
});

const mapDispatchToProps = {
  setFacets: actions.changeTermSearchFilterAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleFilterItem);
