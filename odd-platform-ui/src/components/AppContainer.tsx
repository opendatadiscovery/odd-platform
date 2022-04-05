import { connect } from 'react-redux';
import { fetchDataEntitiesClassesAndTypes } from 'redux/thunks/dataentities.thunks';
import App from './App';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  fetchDataEntitiesClassesAndTypes,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
