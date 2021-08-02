import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getDataEntityOpenAlertList } from 'redux/selectors/alert.selectors';
import {
  fetchDataEntityAlerts,
  updateAlertStatus,
} from 'redux/thunks/alerts.thunks';
import AlertBanners from './AlertBanners';
import { styles } from './AlertBannersStyles';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  alerts: getDataEntityOpenAlertList(state, dataEntityId),
});

const mapDispatchToProps = {
  fetchDataEntityAlerts,
  updateAlertStatus,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AlertBanners));
