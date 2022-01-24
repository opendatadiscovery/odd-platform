import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import {
  getDataEntityAlertListFetching,
  getDataEntityAlertsList,
} from 'redux/selectors/alert.selectors';
import { updateAlertStatus } from 'redux/thunks';
import DataEntityAlerts from './DataEntityAlerts';

interface RouteProps {
  dataEntityId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { dataEntityId },
    },
  }: OwnProps
) => ({
  dataEntityId: parseInt(dataEntityId, 10),
  alertsList: getDataEntityAlertsList(state, dataEntityId),
  isAlertsFetching: getDataEntityAlertListFetching(state),
});

const mapDispatchToProps = { updateAlertStatus };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataEntityAlerts);
