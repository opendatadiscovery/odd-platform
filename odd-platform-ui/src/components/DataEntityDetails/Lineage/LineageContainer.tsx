import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import Lineage from './Lineage';

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
  isLoaded: true,
  dataEntityId: parseInt(dataEntityId, 10),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Lineage);
