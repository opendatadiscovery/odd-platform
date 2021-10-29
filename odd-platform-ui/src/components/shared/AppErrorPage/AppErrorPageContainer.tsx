import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import AppErrorPage from './AppErrorPage';

const mapStateToProps = (state: RootState) => ({
  errorType: '',
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AppErrorPage);
