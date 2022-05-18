import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityCustomMetadataList,
  getDataEntityPredefinedMetadataList,
} from 'redux/selectors/metadata.selectors';
import OverviewMetadata from './OverviewMetadata';

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

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewMetadata);
