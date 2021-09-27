import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchOwnersList } from 'redux/thunks/owners.thunks';
import { getIdentity } from 'redux/selectors/profile.selectors';
import { updateIdentityOwner } from 'redux/thunks/profile.thunks';
import Identity from './Identity';
import { styles } from './IdentityStyles';

const mapStateToProps = (state: RootState) => ({
  identity: getIdentity(state),
});

const mapDispatchToProps = {
  searchOwners: fetchOwnersList,
  updateIdentityOwner,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Identity));
