import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchLabelsList } from 'redux/thunks/labels.thunks';
import LabelsAutocomplete from './LabelsAutocomplete';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  searchLabels: fetchLabelsList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelsAutocomplete);
