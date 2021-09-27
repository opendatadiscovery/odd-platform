import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getMainContentLoading } from 'redux/selectors/mainContentLoader.selectors';
import AppLoadingSpinner from './AppLoadingSpinner';
import { styles } from './AppLoadingSpinnerStyles';

const mapStateToProps = (state: RootState) => ({
  isLoading: getMainContentLoading(state),
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AppLoadingSpinner));
