import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityDetails,
  getDataEntityDetailsFetching,
} from 'redux/selectors/dataentity.selectors';
import { fetchDataEntityDetails } from 'redux/thunks';
import {
  getDataEntityCustomMetadataList,
  getDataEntityPredefinedMetadataList,
} from 'redux/selectors/metadata.selectors';
import ResultItemPreview from './ResultItemPreview';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  dataEntityDetails: getDataEntityDetails(state, dataEntityId),
  isDataEntityLoading: getDataEntityDetailsFetching(state),
  predefinedMetadata: getDataEntityPredefinedMetadataList(
    state,
    dataEntityId
  ),
  customMetadata: getDataEntityCustomMetadataList(state, dataEntityId),
});

const mapDispatchToProps = {
  fetchDataEntityDetails,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResultItemPreview);
