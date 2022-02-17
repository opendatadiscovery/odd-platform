import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import {
  getDatasetFieldEnums,
  getDatasetFieldEnumsCreating,
  getDatasetFieldEnumsFetching,
} from 'redux/selectors/datasetStructure.selectors';
import {
  createDataSetFieldEnum,
  fetchDataSetFieldEnum,
} from 'redux/thunks';
import DatasetFieldEnumsEditForm from './DatasetFieldEnumsEditForm';

const mapStateToProps = (
  state: RootState,
  { datasetFieldId }: { datasetFieldId: number }
) => ({
  datasetFieldEnums: getDatasetFieldEnums(state, datasetFieldId),
  isFetching: getDatasetFieldEnumsFetching(state),
  isCreating: getDatasetFieldEnumsCreating(state),
});

const mapDispatchToProps = {
  fetchDataSetFieldEnum,
  createDataSetFieldEnum,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatasetFieldEnumsEditForm);
