import { createTerm, updateTerm } from 'redux/thunks/terms.thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import {
  getIsTermCreating,
  getIsTermUpdating,
} from 'redux/selectors/terms.selectors';
import TermsForm from './TermsForm';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsTermUpdating(state) || getIsTermCreating(state),
});

const mapDispatchToProps = {
  createTerm,
  updateTerm,
};

export default connect(mapStateToProps, mapDispatchToProps)(TermsForm);
