import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import {
  getDatasetFieldFormData,
  getDatasetFieldFormDataUpdating,
} from 'redux/selectors/datasetStructure.selectors';
import { updateDataSetFieldFormData } from 'redux/thunks';
import DatasetFieldInfoEditForm from './DatasetFieldInfoEditForm';

const mapStateToProps = (
  state: RootState,
  { datasetFieldId }: { datasetFieldId: number }
) => ({
  datasetFieldFormData: getDatasetFieldFormData(state, datasetFieldId),
  isLoading: getDatasetFieldFormDataUpdating(state),
});

const mapDispatchToProps = {
  updateDataSetFieldFormData,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatasetFieldInfoEditForm);
