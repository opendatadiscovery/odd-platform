import { connect } from 'react-redux';
import { Ownership } from 'generated-sources';
import { RootState } from 'redux/interfaces';
import { getDataEntityOwnerUpdating } from 'redux/selectors/dataentity.selectors';
import OwnershipForm from './OwnershipForm';

const mapStateToProps = (
  state: RootState,
  { dataEntityOwnership }: { dataEntityOwnership?: Ownership }
) => ({
  dataEntityOwnership,
  isUpdating: getDataEntityOwnerUpdating(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(OwnershipForm);
