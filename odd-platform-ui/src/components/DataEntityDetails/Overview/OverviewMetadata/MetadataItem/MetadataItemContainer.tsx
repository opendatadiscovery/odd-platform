import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
} from 'redux/thunks/metadata.thunks';
import MetadataItem from './MetadataItem';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
};

export default connect(mapStateToProps, mapDispatchToProps)(MetadataItem);
