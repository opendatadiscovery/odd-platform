import { updateDataEntityInternalName } from 'redux/thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import {
  getDataEntityInternalName,
  getDataEntityInternalNameUpdating,
} from 'redux/selectors/dataentity.selectors';
import InternalNameFormDialog from './InternalNameFormDialog';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  isLoading: getDataEntityInternalNameUpdating(state),
  dataEntityInternalName: getDataEntityInternalName(state, dataEntityId),
});

const mapDispatchToProps = {
  updateDataEntityInternalName,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InternalNameFormDialog);
