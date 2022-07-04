import { connect } from 'react-redux';
import {
  createDataEntitiesSearch,
  fetchIdentity,
  createTermSearch,
} from 'redux/thunks';
import { getIdentity } from 'redux/selectors/profile.selectors';
import { RootState } from 'redux/interfaces';
import AppToolbar from './AppToolbar';

const mapStateToProps = (state: RootState) => ({
  identity: getIdentity(state),
});

const mapDispatchToProps = {
  createDataEntitiesSearch,
  createTermSearch,
  fetchIdentity,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppToolbar);
