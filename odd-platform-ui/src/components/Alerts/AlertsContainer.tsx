import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import Alerts from './Alerts';

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
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Alerts);
