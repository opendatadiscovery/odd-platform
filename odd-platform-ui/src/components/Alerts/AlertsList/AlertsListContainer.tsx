import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getAlertList,
  getAlertListPageInfo,
  getAlertListFetching,
} from 'redux/selectors/alert.selectors';
import AlertsList from './AlertsList';
import { styles } from './AlertsListStyles';

const mapStateToProps = (state: RootState) => ({
  alerts: getAlertList(state),
  pageInfo: getAlertListPageInfo(state),
  alertListFetching: getAlertListFetching(state),
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AlertsList));
