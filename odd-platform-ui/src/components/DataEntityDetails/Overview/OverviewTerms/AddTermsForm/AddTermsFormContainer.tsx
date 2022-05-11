import { createDataEntityTerm } from 'redux/thunks/terms.thunks';
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

const mapDispatchToProps = { createDataEntityTerm };

export default connect(mapStateToProps, mapDispatchToProps)(AddTermsForm);
