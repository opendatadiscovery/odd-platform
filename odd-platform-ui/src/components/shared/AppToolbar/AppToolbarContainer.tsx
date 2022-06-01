import { connect } from 'react-redux';
import {
  createDataEntitiesSearch,
  fetchIdentity,
  fetchAppInfo,
  createTermSearch,
} from 'redux/thunks';
import { getIdentity } from 'redux/selectors/profile.selectors';
import { getVersion } from 'redux/selectors/appInfo.selectors';
import { RootState } from 'redux/interfaces';
import AppToolbar from './AppToolbar';

const mapStateToProps = (state: RootState) => ({
  identity: getIdentity(state),
  version: getVersion(state),
});

const mapDispatchToProps = {
  createDataEntitiesSearch,
  createTermSearch,
  fetchIdentity,
  fetchAppInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppToolbar);
