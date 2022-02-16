import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
} from 'redux/thunks/dataentityLineage.thunks';
import {
  getDataEntityLineage,
  getDataEntityLineageStreamFetching,
} from 'redux/selectors/dataentityLineage.selectors';
import AppGraph from './AppGraph';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  data: getDataEntityLineage(state, dataEntityId),
  isStreamFetching: getDataEntityLineageStreamFetching(state),
});

const mapDispatchToProps = {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppGraph);
