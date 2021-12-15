import { connect } from 'react-redux';
import { fetchLabelsList } from 'redux/thunks/labels.thunks';
import LabelsAutocomplete from './LabelsAutocomplete';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  searchLabels: fetchLabelsList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelsAutocomplete);
