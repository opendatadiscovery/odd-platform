import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityExternalDescription,
  getDataEntityInternalDescription,
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

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewDescription);
