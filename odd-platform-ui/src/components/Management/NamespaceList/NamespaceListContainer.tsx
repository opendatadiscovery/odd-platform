import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getNamespaceList,
  getNamespaceListPage,
  getIsNamespaceCreating,
  getIsNamespaceDeleting,
  getIsNamespaceListFetching,
} from 'redux/selectors/namespace.selectors';
import {
  fetchNamespaceList,
  deleteNamespace,
} from 'redux/thunks/namespace.thunks';
import NamespaceListView from './NamespaceList';
import { styles } from './NamespaceListStyles';

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
)(withStyles(styles)(NamespaceListView));
