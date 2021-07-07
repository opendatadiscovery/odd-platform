import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { updateLabel } from 'redux/thunks/labels.thunks';
import {
  getIsLabelUpdating,
  getIsLabelDeleting,
} from 'redux/selectors/labels.selectors';
import LabelEditForm from './LabelEditForm';
import { styles } from './LabelEditFormStyles';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsLabelUpdating(state) || getIsLabelDeleting(state),
});

const mapDispatchToProps = {
  updateLabel,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LabelEditForm));
