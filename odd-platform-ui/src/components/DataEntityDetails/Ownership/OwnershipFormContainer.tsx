import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { Ownership } from 'generated-sources';
import { RootState } from 'redux/interfaces';
import {
  fetchOwnersList,
  createDataEntityOwnership,
  updateDataEntityOwnership,
  fetchRoleList,
} from 'redux/thunks/owners.thunks';
import { getDataEntityOwnerUpdating } from 'redux/selectors/dataentity.selectors';
import OwnershipForm from './OwnershipForm';
import { styles } from './OwnershipFormStyles';

const mapStateToProps = (
  state: RootState,
  { dataEntityOwnership }: { dataEntityOwnership?: Ownership }
) => ({
  dataEntityOwnership,
  isUpdating: getDataEntityOwnerUpdating(state),
});

const mapDispatchToProps = {
  createDataEntityOwnership,
  updateDataEntityOwnership,
  searchOwners: fetchOwnersList,
  searchRoles: fetchRoleList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(OwnershipForm));
