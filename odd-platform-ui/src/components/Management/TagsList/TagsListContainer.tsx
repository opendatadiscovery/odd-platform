import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getIsTagCreating,
  getIsTagDeleting,
  getIsTagsListFetching,
  getTagsList,
  getTagsListPage,
} from 'redux/selectors/tags.selectors';
import { deleteTag, fetchTagsList } from 'redux/thunks/tags.thunks';
import TagsListView from './TagsList';

const mapStateToProps = (state: RootState) => ({
  tagsList: getTagsList(state),
  isFetching: getIsTagsListFetching(state),
  isDeleting: getIsTagDeleting(state),
  isCreating: getIsTagCreating(state),
  pageInfo: getTagsListPage(state),
});

const mapDispatchToProps = {
  fetchTagsList,
  deleteTag,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagsListView);
