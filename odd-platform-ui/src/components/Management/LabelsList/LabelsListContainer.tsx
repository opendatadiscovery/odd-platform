import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getIsLabelCreating,
  getIsLabelDeleting,
  getIsLabelsListFetching,
  getLabelsList,
  getLabelsListPage,
} from 'redux/selectors/labels.selectors';
import { deleteLabel, fetchLabelsList } from 'redux/thunks/labels.thunks';
import LabelsListView from './LabelsList';

const mapStateToProps = (state: RootState) => ({
  labelsList: getLabelsList(state),
  isFetching: getIsLabelsListFetching(state),
  isDeleting: getIsLabelDeleting(state),
  isCreating: getIsLabelCreating(state),
  pageInfo: getLabelsListPage(state),
});

const mapDispatchToProps = {
  fetchLabelsList,
  deleteLabel,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelsListView);
