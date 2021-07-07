import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getSearchQuery } from 'redux/selectors/dataentitySearch.selectors';
import { createDataEntitiesSearch } from 'redux/thunks';
import MainSearch from 'components/shared/MainSearch/MainSearch';
import { styles } from 'components/shared/MainSearch/MainSearchStyles';

const mapStateToProps = (state: RootState) => ({
  query: getSearchQuery(state),
});

const mapDispatchToProps = {
  createDataEntitiesSearch,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MainSearch));
