import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityDetails,
  getDataEntityOwnership,
} from 'redux/selectors';
import OverviewGeneral from './OverviewGeneral';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  dataEntityId,
  dataEntityDetails: getDataEntityDetails(state, dataEntityId),
  ownership: getDataEntityOwnership(state, dataEntityId),
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewGeneral);
