import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
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
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataEntityAlerts);
