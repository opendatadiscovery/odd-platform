import { fetchTermsList } from 'redux/thunks/terms.thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import TermsAutocomplete from './TermsAutocomplete';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  searchTerms: fetchTermsList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TermsAutocomplete);
