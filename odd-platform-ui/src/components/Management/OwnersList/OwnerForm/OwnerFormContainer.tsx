import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { createOwner, updateOwner } from 'redux/thunks/owners.thunks';
import { getIsOwnerCreating } from 'redux/selectors/owners.selectors';
import OwnerForm from './OwnerForm';
import { styles } from './OwnerFormStyles';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsOwnerCreating(state),
});

const mapDispatchToProps = {
  createOwner,
  updateOwner,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(OwnerForm));
