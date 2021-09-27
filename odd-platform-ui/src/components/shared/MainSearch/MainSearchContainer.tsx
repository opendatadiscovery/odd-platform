import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchQuery,
  getSearchSuggestions,
} from 'redux/selectors/dataentitySearch.selectors';
import {
  createDataEntitiesSearch,
  fetchSearchSuggestions,
} from 'redux/thunks';
import MainSearch from 'components/shared/MainSearch/MainSearch';
import { styles } from 'components/shared/MainSearch/MainSearchStyles';

const mapStateToProps = (state: RootState) => ({
  query: getSearchQuery(state),
  suggestions: getSearchSuggestions(state),
});

const mapDispatchToProps = {
  createDataEntitiesSearch,
  fetchSearchSuggestions,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MainSearch));
