import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { updateLabel } from 'redux/thunks/labels.thunks';
import {
  getIsLabelDeleting,
  getIsLabelUpdating,
} from 'redux/selectors/labels.selectors';
import LabelEditForm from './LabelEditForm';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsLabelUpdating(state) || getIsLabelDeleting(state),
});

const mapDispatchToProps = {
  updateLabel,
};

export default connect(mapStateToProps, mapDispatchToProps)(LabelEditForm);
