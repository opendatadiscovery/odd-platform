import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getDataEntityAlertList } from 'redux/selectors/alert.selectors';
import { fetchDataEntityAlerts } from 'redux/thunks/alerts.thunks';
import AlertBanners from './AlertBanners';
import { styles } from './AlertBannersStyles';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  alerts: getDataEntityAlertList(state, dataEntityId),
});

const mapDispatchToProps = {
  fetchDataEntityAlerts,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AlertBanners));
