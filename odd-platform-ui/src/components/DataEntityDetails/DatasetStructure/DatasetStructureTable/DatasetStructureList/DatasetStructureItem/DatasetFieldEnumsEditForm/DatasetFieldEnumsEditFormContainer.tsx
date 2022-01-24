import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import {
  getDatasetFieldData,
  getDatasetFieldFormDataUpdating,
} from 'redux/selectors/datasetStructure.selectors';
import { updateDataSetFieldFormData } from 'redux/thunks';
import DatasetFieldEnumsEditForm from './DatasetFieldEnumsEditForm';

const mapStateToProps = (
  state: RootState,
  { datasetFieldId }: { datasetFieldId: number }
) => ({
  datasetFieldFormData: getDatasetFieldData(state, datasetFieldId),
  isLoading: getDatasetFieldFormDataUpdating(state),
});

const mapDispatchToProps = {
  updateDataSetFieldFormData,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatasetFieldEnumsEditForm);
