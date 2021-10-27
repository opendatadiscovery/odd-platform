import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
} from 'redux/thunks/metadata.thunks';
import MetadataItem from './MetadataItem';
import { styles } from './MetadataItemStyles';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MetadataItem));
