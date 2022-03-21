import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getCollectorsList,
  getCollectorsListPage,
  getIsCollectorCreating,
  getIsCollectorsListFetching,
  getIsCollectorDeleting,
} from 'redux/selectors/collectors.selectors';
import { fetchCollectorsList } from 'redux/thunks';
import CollectorsListView from './CollectorsList';

const mapStateToProps = (state: RootState) => ({
  collectorsList: getCollectorsList(state),
  isCreating: getIsCollectorCreating(state),
  isDeleting: getIsCollectorDeleting(state),
  pageInfo: getCollectorsListPage(state),
  isCollectorsListFetching: getIsCollectorsListFetching(state),
});

const mapDispatchToProps = {
  fetchCollectorsList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectorsListView);
