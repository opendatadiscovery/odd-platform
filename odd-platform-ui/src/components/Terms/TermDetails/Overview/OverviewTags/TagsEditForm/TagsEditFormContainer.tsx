import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchTagsList, updateTermDetailsTags } from 'redux/thunks';
import {
  getTermDetailsTags,
  getTermDetailsTagsUpdating,
} from 'redux/selectors/terms.selectors';
import TagsEditForm from './TagsEditForm';

const mapStateToProps = (
  state: RootState,
  { termId }: { termId: number }
) => ({
  termDetailsTags: getTermDetailsTags(state, termId),
  isLoading: getTermDetailsTagsUpdating(state),
});

const mapDispatchToProps = {
  updateTermDetailsTags,
  searchTags: fetchTagsList,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagsEditForm);
