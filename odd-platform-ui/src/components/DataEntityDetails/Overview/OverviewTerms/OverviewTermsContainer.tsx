import { connect } from 'react-redux';
import { deleteDataEntityTerm } from 'redux/thunks';
import OverviewTerms from './OverviewTerms';

const mapStateToProps = () => ({});

const mapDispatchToProps = { deleteDataEntityTerm };

export default connect(mapStateToProps, mapDispatchToProps)(OverviewTerms);
