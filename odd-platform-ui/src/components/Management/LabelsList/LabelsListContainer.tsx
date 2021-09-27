import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getLabelsList,
  getIsLabelDeleting,
  getLabelsListPage,
  getIsLabelCreating,
  getIsLabelsListFetching,
} from 'redux/selectors/labels.selectors';
import { fetchLabelsList, deleteLabel } from 'redux/thunks/labels.thunks';
import LabelsListView from './LabelsList';
import { styles } from './LabelsListStyles';

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
)(withStyles(styles)(LabelsListView));
