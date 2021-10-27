import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { updateDataSetFieldDescription } from 'redux/thunks/datasetStructure.thunks';
import { getDatasetStructure } from 'redux/selectors/datasetStructure.selectors';
import DatasetStructureItem from './DatasetStructureTable';
import { styles } from './DatasetStructureTableStyles';

const mapStateToProps = (
  state: RootState,
  {
    dataEntityId,
    versionId,
  }: {
    dataEntityId: number;
    versionId?: number;
  }
) => ({
  datasetStructureRoot: getDatasetStructure(state, {
    datasetId: dataEntityId,
    versionId,
  }),
});

const mapDispatchToProps = {
  updateDataSetFieldDescription,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DatasetStructureItem));
