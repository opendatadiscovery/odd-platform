import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import Management from './Management';
import { styles } from './ManagementStyles';

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Management));
