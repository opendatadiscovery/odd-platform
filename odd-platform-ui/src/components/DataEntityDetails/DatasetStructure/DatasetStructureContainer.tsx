import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import {
  fetchDataSetStructure,
  fetchDataSetStructureLatest,
  updateDataSetFieldDescription,
} from 'redux/thunks/datasetStructure.thunks';
import {
  getDatasetStats,
  getDatasetVersions,
} from 'redux/selectors/dataentity.selectors';
import {
  getDataSetStructureFetching,
  getDatasetStructureTypeStats,
  getDatasetVersionId,
} from 'redux/selectors/datasetStructure.selectors';
import DatasetStructure from './DatasetStructure';
import { styles } from './DatasetStructureStyles';

interface RouteProps {
  dataEntityId: string;
  versionId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { dataEntityId, versionId },
    },
  }: OwnProps
) => ({
  dataEntityId: parseInt(dataEntityId, 10),
  versionIdParam: parseInt(versionId, 10),
  datasetStructureVersion: getDatasetVersionId(state, {
    datasetId: dataEntityId,
    versionId,
  }),
  datasetStats: getDatasetStats(state, dataEntityId),
  datasetVersions: getDatasetVersions(state, dataEntityId),
  typesCount: getDatasetStructureTypeStats(state, {
    datasetId: dataEntityId,
    versionId,
  }),
  isDatasetStructureFetching: getDataSetStructureFetching(state),
});

const mapDispatchToProps = {
  fetchDataSetStructureLatest,
  fetchDataSetStructure,
  updateDataSetFieldDescription,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DatasetStructure));
