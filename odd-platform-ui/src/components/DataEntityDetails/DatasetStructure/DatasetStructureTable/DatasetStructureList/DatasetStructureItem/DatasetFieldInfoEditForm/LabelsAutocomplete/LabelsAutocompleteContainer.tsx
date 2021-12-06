import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchLabelsList } from 'redux/thunks/labels.thunks';
import LabelsAutocomplete from 'components/DataEntityDetails/DatasetStructure/DatasetStructureTable/DatasetStructureList/DatasetStructureItem/DatasetFieldInfoEditForm/LabelsAutocomplete/LabelsAutocomplete';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  searchLabels: fetchLabelsList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelsAutocomplete);
