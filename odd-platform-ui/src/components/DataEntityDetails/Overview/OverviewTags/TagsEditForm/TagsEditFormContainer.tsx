import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityTags,
  getDataEntityTagsUpdating,
} from 'redux/selectors/dataentity.selectors';
import TagsEditForm from 'components/DataEntityDetails/Overview/OverviewTags/TagsEditForm/TagsEditForm';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  dataEntityTags: getDataEntityTags(state, dataEntityId),
  isLoading: getDataEntityTagsUpdating(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(TagsEditForm);
