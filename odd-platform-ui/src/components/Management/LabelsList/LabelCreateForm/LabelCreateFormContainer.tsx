import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { createLabel } from 'redux/thunks/labels.thunks';
import { getIsLabelCreating } from 'redux/selectors/labels.selectors';
import LabelCreateForm from './LabelCreateForm';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsLabelCreating(state),
});

const mapDispatchToProps = {
  createLabel,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelCreateForm);
