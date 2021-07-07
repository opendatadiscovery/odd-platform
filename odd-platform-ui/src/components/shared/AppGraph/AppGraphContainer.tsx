import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchDataEntityLineage } from 'redux/thunks/dataentityLineage.thunks';
import { getDataEntityLineage } from 'redux/selectors/dataentityLineage.selectors';
import AppGraph from './AppGraph';
import { styles } from './AppGraphStyles';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  isLoaded: true,
  data: getDataEntityLineage(state, dataEntityId),
});

const mapDispatchToProps = {
  fetchDataEntityLineage,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AppGraph));
