import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getIdentity } from 'redux/selectors/profile.selectors';
// import { updateIdentityOwner } from 'redux/thunks/profile.thunks';
import Identity from './Identity';

const mapStateToProps = (state: RootState) => ({
  identity: getIdentity(state),
});

const mapDispatchToProps = {
  // updateIdentityOwner,
};

export default connect(mapStateToProps, mapDispatchToProps)(Identity);
