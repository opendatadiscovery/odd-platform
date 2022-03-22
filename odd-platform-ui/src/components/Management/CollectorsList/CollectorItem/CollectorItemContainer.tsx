import { connect } from 'react-redux';
import { deleteCollector } from 'redux/thunks/collectors.thunks';
import CollectorItem from './CollectorItem';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  deleteCollector,
};

export default connect(mapStateToProps, mapDispatchToProps)(CollectorItem);
