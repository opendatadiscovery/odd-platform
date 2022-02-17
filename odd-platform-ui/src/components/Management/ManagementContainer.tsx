import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import Management from './Management';

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

export default connect(mapStateToProps, mapDispatchToProps)(Management);
