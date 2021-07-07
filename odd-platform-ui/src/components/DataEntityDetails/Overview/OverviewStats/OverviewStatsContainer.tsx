import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getDataEntityDetails } from 'redux/selectors/dataentity.selectors';
import OverviewStats from './OverviewStats';
import { styles } from './OverviewStatsStyles';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  dataEntityDetails: getDataEntityDetails(state, dataEntityId),
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(OverviewStats));
