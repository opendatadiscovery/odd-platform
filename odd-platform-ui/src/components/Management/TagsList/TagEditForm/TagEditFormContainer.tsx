import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { updateTag } from 'redux/thunks/tags.thunks';
import {
  getIsTagDeleting,
  getIsTagUpdating,
} from 'redux/selectors/tags.selectors';
import TagEditForm from './TagEditForm';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsTagUpdating(state) || getIsTagDeleting(state),
});

const mapDispatchToProps = {
  updateTag,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagEditForm);
