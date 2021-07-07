import { withStyles } from '@material-ui/core';
import { updateDataSetFieldDescription } from 'redux/thunks/datasetStructure.thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import {
  getDatasetFieldDescriptionUpdating,
  getDatasetFieldInternalDescription,
} from 'redux/selectors/datasetStructure.selectors';
import InternalDescriptionFormDialog from './InternalDescriptionFormDialog';
import { styles } from './InternalDescriptionFormDialogStyles';

const mapStateToProps = (
  state: RootState,
  { datasetFieldId }: { datasetFieldId: number }
) => ({
  isLoading: getDatasetFieldDescriptionUpdating(state),
  datasetFieldIdInternalDescription: getDatasetFieldInternalDescription(
    state,
    datasetFieldId
  ),
});

const mapDispatchToProps = {
  updateDataSetFieldDescription,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(InternalDescriptionFormDialog));
