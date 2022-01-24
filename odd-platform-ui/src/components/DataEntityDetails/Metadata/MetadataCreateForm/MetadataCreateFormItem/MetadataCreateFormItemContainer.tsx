import { connect } from 'react-redux';
import { searchMetadata } from 'redux/thunks/metadata.thunks';
import MetadataCreateFormItem from './MetadataCreateFormItem';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  searchMetadata,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MetadataCreateFormItem);
