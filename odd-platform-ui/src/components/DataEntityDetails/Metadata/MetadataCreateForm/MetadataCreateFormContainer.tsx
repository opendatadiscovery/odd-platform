import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getMetadataFieldList,
  getDataEntityMetadataCreateFetching,
} from 'redux/selectors/metadata.selectors';
import {
  searchMetadata,
  createDataEntityCustomMetadata,
} from 'redux/thunks/metadata.thunks';
import MetadataCreateForm from './MetadataCreateForm';
import { styles } from './MetadataCreateFormStyles';

const mapStateToProps = (state: RootState) => ({
  metadataOptions: getMetadataFieldList(state),
  isLoading: getDataEntityMetadataCreateFetching(state),
});

const mapDispatchToProps = {
  searchMetadata,
  createDataEntityCustomMetadata,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MetadataCreateForm));
