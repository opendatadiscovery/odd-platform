import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getTagsList,
  getIsTagDeleting,
  getTagsListPage,
  getIsTagCreating,
  getIsTagsListFetching,
} from 'redux/selectors/tags.selectors';
import { fetchTagsList, deleteTag } from 'redux/thunks/tags.thunks';
import TagsListView from './TagsList';
import { styles } from './TagsListStyles';

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TagsListView));
