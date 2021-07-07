import { connect } from 'react-redux';
import { fetchDataEntitiesTypes } from 'redux/thunks/dataentities.thunks';
import App from './App';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  fetchDataEntitiesTypes,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
