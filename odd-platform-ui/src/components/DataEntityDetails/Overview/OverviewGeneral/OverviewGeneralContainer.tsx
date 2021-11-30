import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getDataEntityDetails } from 'redux/selectors/dataentity.selectors';
import { getDataEntityOwnership } from 'redux/selectors/owners.selectors';
import { deleteDataEntityOwnership } from 'redux/thunks/owners.thunks';
import OverviewGeneralProps from './OverviewGeneral';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  dataEntityId,
  dataEntityDetails: getDataEntityDetails(state, dataEntityId),
  ownership: getDataEntityOwnership(state, dataEntityId),
});

const mapDispatchToProps = {
  deleteDataEntityOwnership,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewGeneralProps);
