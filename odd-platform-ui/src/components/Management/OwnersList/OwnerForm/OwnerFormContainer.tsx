import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getIsOwnerCreating } from 'redux/selectors/owners.selectors';
import OwnerForm from './OwnerForm';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsOwnerCreating(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(OwnerForm);
