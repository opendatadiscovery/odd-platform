import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getAlertList,
  getAlertListFetching,
  getAlertListPageInfo,
} from 'redux/selectors/alert.selectors';
import { updateAlertStatus } from 'redux/thunks';
import AlertsList from './AlertsList';

const mapStateToProps = (state: RootState) => ({
  alerts: getAlertList(state),
  pageInfo: getAlertListPageInfo(state),
  alertListFetching: getAlertListFetching(state),
});

const mapDispatchToProps = { updateAlertStatus };

export default connect(mapStateToProps, mapDispatchToProps)(AlertsList);
