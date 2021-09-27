import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityPredefinedMetadataList,
  getDataEntityCustomMetadataList,
} from 'redux/selectors/metadata.selectors';
import {
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
} from 'redux/thunks/metadata.thunks';
import OverviewMetadata from './OverviewMetadata';
import { styles } from './OverviewMetadataStyles';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  predefinedMetadata: getDataEntityPredefinedMetadataList(
    state,
    dataEntityId
  ),
  customMetadata: getDataEntityCustomMetadataList(state, dataEntityId),
});

const mapDispatchToProps = {
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(OverviewMetadata));
