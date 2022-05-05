import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getDataEntityDetails } from 'redux/selectors/dataentity.selectors';
import { getDataEntityOwnership } from 'redux/selectors/owners.selectors';
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
