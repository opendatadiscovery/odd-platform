import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { updateDataEntityInternalDescription } from 'redux/thunks/dataentities.thunks';
import {
  getDataEntityInternalDescription,
  getDataEntityExternalDescription,
} from 'redux/selectors/dataentity.selectors';
import OverviewDescription from './OverviewDescription';

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
)(OverviewDescription);
