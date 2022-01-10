import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getIsNamespaceCreating,
  getIsNamespaceDeleting,
  getIsNamespaceListFetching,
  getNamespaceList,
  getNamespaceListPage,
} from 'redux/selectors/namespace.selectors';
import {
  deleteNamespace,
  fetchNamespaceList,
} from 'redux/thunks/namespace.thunks';
import NamespaceListView from './NamespaceList';

const mapStateToProps = (state: RootState) => ({
  namespacesList: getNamespaceList(state),
  isFetching: getIsNamespaceListFetching(state),
  isDeleting: getIsNamespaceDeleting(state),
  isCreating: getIsNamespaceCreating(state),
  pageInfo: getNamespaceListPage(state),
});

const mapDispatchToProps = {
  fetchNamespaceList,
  deleteNamespace,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NamespaceListView);
