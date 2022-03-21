import { connect } from 'react-redux';
import { deleteCollector, regenerateCollectorToken } from 'redux/thunks';
import CollectorItemToken from './CollectorItemToken';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  deleteCollector,
  regenerateCollectorToken,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectorItemToken);
