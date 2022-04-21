import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getTermDetailsTags,
  getTermDetailsTagsUpdating,
} from 'redux/selectors/termDetails.selectors';
import { fetchTagsList, updateTermDetailsTags } from 'redux/thunks';
import TagsEditForm from 'components/TermDetails/Overview/OverviewTags/TagsEditForm/TagsEditForm';

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
