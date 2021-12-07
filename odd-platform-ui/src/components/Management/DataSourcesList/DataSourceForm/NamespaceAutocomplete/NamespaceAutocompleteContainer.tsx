import { connect } from 'react-redux';
import { fetchNamespaceList } from 'redux/thunks';
import NamespaceAutocomplete from './NamespaceAutocomplete';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  searchNamespace: fetchNamespaceList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NamespaceAutocomplete);
