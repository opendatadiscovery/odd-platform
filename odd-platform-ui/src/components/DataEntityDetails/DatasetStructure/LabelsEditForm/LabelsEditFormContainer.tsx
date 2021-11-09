import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import // getDatasetFieldLabels,
// getDatasetFieldLabelsUpdating,
'redux/selectors/datasetStructure.selectors';
// import { updateDataSetFieldLabels } from 'redux/thunks/datasetStructure.thunks';
import { fetchLabelsList } from 'redux/thunks/labels.thunks';
import LabelsEditForm from './LabelsEditForm';
import { styles } from './LabelsEditFormStyles';

const mapStateToProps = (
  state: RootState,
  { datasetFieldId }: { datasetFieldId: number }
) => ({
  // datasetFieldLabels: getDatasetFieldLabels(state, datasetFieldId),
  // isLoading: getDatasetFieldLabelsUpdating(state),
});

const mapDispatchToProps = {
  // updateDataSetFieldLabels,
  searchLabels: fetchLabelsList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LabelsEditForm));
