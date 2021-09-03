import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  fetchDataEntityUpstreamLineage,
  fetchDataEntityDownstreamLineage,
} from 'redux/thunks/dataentityLineage.thunks';
import {
  getDataEntityLineage,
  getDataEntityLineageFetching,
  getDataEntityLineageStreamFetching,
} from 'redux/selectors/dataentityLineage.selectors';
import AppGraph from './AppGraph';
import { styles } from './AppGraphStyles';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  isLineageFetching: getDataEntityLineageFetching(state),
  data: getDataEntityLineage(state, dataEntityId),
  isStreamFetching: getDataEntityLineageStreamFetching(state),
});

const mapDispatchToProps = {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AppGraph));
