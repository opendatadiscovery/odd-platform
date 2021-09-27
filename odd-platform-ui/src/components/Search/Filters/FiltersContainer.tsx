import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchEntityType,
  getSearchIsUpdated,
} from 'redux/selectors/dataentitySearch.selectors';
import {
  getDataSourcesList,
  getIsDataSourcesListFetching,
} from 'redux/selectors/datasources.selectors';
import { fetchDataSourcesList } from 'redux/thunks/datasources.thunks';
import * as actions from 'redux/actions';
import Filters from './Filters';
import { styles } from './FiltersStyles';

const mapStateToProps = (state: RootState) => ({
  searchType: getSearchEntityType(state),
  datasources: getDataSourcesList(state),
  isSearchFacetsUpdating: getSearchIsUpdated(state),
  isDatasourceListFetching: getIsDataSourcesListFetching(state),
});

const mapDispatchToProps = {
  fetchDataSourcesList,
  clearDataEntitySearchFilters: actions.clearDataEntitySearchFiltersAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Filters));
