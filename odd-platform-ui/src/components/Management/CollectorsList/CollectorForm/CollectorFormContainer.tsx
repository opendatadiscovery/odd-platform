import {
  registerCollector,
  updateCollector,
} from 'redux/thunks/collectors.thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import { getIsCollectorCreating } from 'redux/selectors/collectors.selectors';
import CollectorForm from 'components/Management/CollectorsList/CollectorForm/CollectorForm';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsCollectorCreating(state),
});

const mapDispatchToProps = {
  registerCollector,
  updateCollector,
};

export default connect(mapStateToProps, mapDispatchToProps)(CollectorForm);
