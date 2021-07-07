import { RouteComponentProps } from 'react-router-dom';
import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchId,
  getSearchFiltersData,
  getSearchFiltersSynced,
  getSearchQuery,
  getSearchMyObjects,
} from 'redux/selectors/dataentitySearch.selectors';
import {
  getDataEntitiesSearchDetails,
  updateDataEntitiesSearch,
} from 'redux/thunks';
import Search from './Search';
import { styles } from './SearchStyles';

interface RouteProps {
  searchId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { searchId },
    },
  }: OwnProps
) => ({
  searchIdParam: searchId,
  searchId: getSearchId(state),
  searchQuery: getSearchQuery(state),
  searchMyObjects: getSearchMyObjects(state),
  searchFilterParams: getSearchFiltersData(state),
  searchFiltersSynced: getSearchFiltersSynced(state),
});

const mapDispatchToProps = {
  getDataEntitiesSearchDetails,
  updateDataEntitiesSearch,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Search));
