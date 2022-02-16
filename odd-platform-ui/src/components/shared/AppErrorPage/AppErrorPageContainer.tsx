import { connect } from 'react-redux';
import AppErrorPage from './AppErrorPage';

const mapStateToProps = () => ({
  errorType: '',
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AppErrorPage);
