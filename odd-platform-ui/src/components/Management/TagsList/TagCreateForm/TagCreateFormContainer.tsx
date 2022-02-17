import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { createTag } from 'redux/thunks/tags.thunks';
import { getIsTagCreating } from 'redux/selectors/tags.selectors';
import TagCreateForm from './TagCreateForm';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsTagCreating(state),
});

const mapDispatchToProps = {
  createTag,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagCreateForm);
