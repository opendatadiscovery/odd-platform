import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  createNamespace,
  updateNamespace,
} from 'redux/thunks/namespace.thunks';
import {
  getIsNamespaceCreating,
  getIsNamespaceUpdating,
} from 'redux/selectors/namespace.selectors';
import NamespaceForm from './NamespaceForm';

const mapStateToProps = (state: RootState) => ({
  isLoading:
    getIsNamespaceUpdating(state) || getIsNamespaceCreating(state),
});

const mapDispatchToProps = {
  createNamespace,
  updateNamespace,
};

export default connect(mapStateToProps, mapDispatchToProps)(NamespaceForm);
