import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { withStyles } from '@material-ui/core';
import {
  getSearchTotals,
  getSearchResults,
  getSearchEntityType,
  getSearchId,
  getSearchResultsPage,
  getSearchFiltersSynced,
  getSearchIsFetching,
  getSearchIsCreated,
  getSearchIsUpdated,
} from 'redux/selectors/dataentitySearch.selectors';
import { getDataEntityTypesByName } from 'redux/selectors/dataentity.selectors';
import { getDataEntitiesSearchResults } from 'redux/thunks/dataentitiesSearch.thunks';
import Results from './Results';
import { styles } from './ResultsStyles';

const mapStateToProps = (state: RootState) => ({
  searchId: getSearchId(state),
  searchType: getSearchEntityType(state),
  dataEntityTypesByName: getDataEntityTypesByName(state),
  totals: getSearchTotals(state),
  searchResults: getSearchResults(state),
  pageInfo: getSearchResultsPage(state),
  searchFiltersSynced: getSearchFiltersSynced(state),
  isSearchFetching: getSearchIsFetching(state),
  isSearchCreated: getSearchIsCreated(state),
  isSearchUpdated: getSearchIsUpdated(state),
});

const mapDispatchToProps = {
  getDataEntitiesSearchResults,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Results));
