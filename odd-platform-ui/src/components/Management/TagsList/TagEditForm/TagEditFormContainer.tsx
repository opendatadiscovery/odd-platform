import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { updateTag } from 'redux/thunks/tags.thunks';
import {
  getIsTagUpdating,
  getIsTagDeleting,
} from 'redux/selectors/tags.selectors';
import TagEditForm from './TagEditForm';
import { styles } from './TagEditFormStyles';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsTagUpdating(state) || getIsTagDeleting(state),
});

const mapDispatchToProps = {
  updateTag,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TagEditForm));
