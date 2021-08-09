import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { createNamespace, updateNamespace } from 'redux/thunks/namespace.thunks';
import {
  getIsNamespaceUpdating,
  getIsNamespaceDeleting,
} from 'redux/selectors/namespace.selectors';
import NamespaceForm from './NamespaceForm';
import { styles } from './NamespaceFormStyles';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsNamespaceUpdating(state) || getIsNamespaceDeleting(state),
});

const mapDispatchToProps = {
  createNamespace,
  updateNamespace,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NamespaceForm));
