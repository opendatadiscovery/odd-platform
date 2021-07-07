import { withStyles } from '@material-ui/core';
import { updateDataEntityInternalName } from 'redux/thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import {
  getDataEntityInternalNameUpdating,
  getDataEntityInternalName,
} from 'redux/selectors/dataentity.selectors';
import InternalNameFormDialog from './InternalNameFormDialog';
import { styles } from './InternalNameFormDialogStyles';

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
)(withStyles(styles)(InternalNameFormDialog));
