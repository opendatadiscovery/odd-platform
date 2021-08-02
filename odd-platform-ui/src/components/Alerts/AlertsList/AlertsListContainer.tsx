import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getAlertList,
  getAlertListPageInfo,
} from 'redux/selectors/alert.selectors';
import AlertsList from './AlertsList';
import { styles } from './AlertsListStyles';

const mapStateToProps = (state: RootState) => ({
  alerts: getAlertList(state),
  pageInfo: getAlertListPageInfo(state),
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AlertsList));
