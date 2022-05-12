import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import {
  getIsTermCreating,
  getIsTermUpdating,
} from 'redux/selectors/terms.selectors';
import AddTermsForm from './AddTermsForm';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsTermUpdating(state) || getIsTermCreating(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AddTermsForm);
