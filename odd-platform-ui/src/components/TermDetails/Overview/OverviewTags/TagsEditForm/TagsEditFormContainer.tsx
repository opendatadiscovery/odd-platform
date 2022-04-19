import { updateDataEntityTags } from 'redux/thunks/dataentities.thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getTermDetailsTags,
  getTermDetailsTagsUpdating,
} from 'redux/selectors/termDetails.selectors';
import { fetchTagsList } from 'redux/thunks';
import TagsEditForm from 'components/DataEntityDetails/Overview/OverviewTags/TagsEditForm/TagsEditForm';

const mapStateToProps = (
  state: RootState,
  { termId }: { termId: number }
) => ({
  termDetailsTags: getTermDetailsTags(state, termId),
  isLoading: getTermDetailsTagsUpdating(state),
});

const mapDispatchToProps = {
  updateDataEntityTags, // todo replace with term details
  searchTags: fetchTagsList,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagsEditForm);
