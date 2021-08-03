import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import {
  fetchAlertsTotals,
  fetchAllAlertList,
  fetchMyAlertList,
  fetchMyDependentsAlertList,
} from 'redux/thunks/alerts.thunks';
import { getAlertTotals } from 'redux/selectors/alert.selectors';
import * as actions from 'redux/actions';
import Alerts from './Alerts';
import { styles } from './AlertsStyles';

interface RouteProps {
  viewType: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { viewType },
    },
  }: OwnProps
) => ({
  viewType,
  totals: getAlertTotals(state),
});

const mapDispatchToProps = {
  fetchAlertsTotals,
  fetchAllAlertList,
  fetchMyAlertList,
  fetchMyDependentsAlertList,
  alertsFilterUpdateAction: actions.changeAlertsFilterAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Alerts));
