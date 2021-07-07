import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { updateDataEntityInternalDescription } from 'redux/thunks/dataentities.thunks';
import {
  getDataEntityInternalDescription,
  getDataEntityExternalDescription,
} from 'redux/selectors/dataentity.selectors';
import OverviewDescription from './OverviewDescription';
import { styles } from './OverviewDescriptionStyles';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  dataEntityInternalDescription: getDataEntityInternalDescription(
    state,
    dataEntityId
  ),
  dataEntityExternalDescription: getDataEntityExternalDescription(
    state,
    dataEntityId
  ),
});

const mapDispatchToProps = {
  updateDataEntityInternalDescription,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(OverviewDescription));
