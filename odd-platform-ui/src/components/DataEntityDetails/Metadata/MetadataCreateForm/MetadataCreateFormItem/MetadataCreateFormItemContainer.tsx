import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { searchMetadata } from 'redux/thunks/metadata.thunks';
import MetadataCreateFormItem from './MetadataCreateFormItem';
import { styles } from './MetadataCreateFormItemStyles';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  searchMetadata,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MetadataCreateFormItem));
