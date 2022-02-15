import { connect } from 'react-redux';
import {
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
} from 'redux/thunks/metadata.thunks';
import MetadataItem from './MetadataItem';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
};

export default connect(mapStateToProps, mapDispatchToProps)(MetadataItem);
