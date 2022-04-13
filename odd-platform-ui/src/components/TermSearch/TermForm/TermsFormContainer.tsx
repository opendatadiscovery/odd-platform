import { createTerm, updateTerm } from 'redux/thunks/terms.thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import { getIsTermCreating } from 'redux/selectors/terms.selectors';
import TermsForm from './TermsForm';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsTermCreating(state),
});

const mapDispatchToProps = {
  createTerm,
  updateTerm,
};

export default connect(mapStateToProps, mapDispatchToProps)(TermsForm);
