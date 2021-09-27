import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getMyEntities,
  getMyEntitiesUpstream,
  getPopularEntities,
  getMyEntitiesDownstream,
  getMyDataEntitiesFetching,
  getMyUpstreamDataEntitiesFetching,
  getMyDownstreamDataEntitiesFetching,
  getPopularDataEntitiesFetching,
} from 'redux/selectors/dataentity.selectors';
import {
  fetchMyDataEntitiesList,
  fetchMyUpstreamDataEntitiesList,
  fetchMyDownstreamDataEntitiesList,
  fetchPopularDataEntitiesList,
} from 'redux/thunks/dataentities.thunks';
import { fetchIdentity } from 'redux/thunks/profile.thunks';
import { fetchAlertsTotals } from 'redux/thunks/alerts.thunks';
import {
  getIdentity,
  getIdentityFetched,
} from 'redux/selectors/profile.selectors';
import { getAlertTotals } from 'redux/selectors/alert.selectors';
import { getMainOverviewContentIsFetching } from 'redux/selectors/mainContentLoader.selectors';
import { fetchTagsList } from 'redux/thunks';
import { getTagsList } from 'redux/selectors/tags.selectors';
import Overview from './Overview';
import { styles } from './OverviewStyles';

const mapStateToProps = (state: RootState) => ({
  identity: getIdentity(state),
  identityFetched: getIdentityFetched(state),
  alertTotals: getAlertTotals(state),
  myEntities: getMyEntities(state),
  myEntitiesDownstream: getMyEntitiesDownstream(state),
  myEntitiesUpstream: getMyEntitiesUpstream(state),
  popularEntities: getPopularEntities(state),
  myDataEntitiesFetching: getMyDataEntitiesFetching(state),
  myUpstreamDataEntitiesFetching: getMyUpstreamDataEntitiesFetching(state),
  myDownstreamDataEntitiesFetching: getMyDownstreamDataEntitiesFetching(
    state
  ),
  popularDataEntitiesFetching: getPopularDataEntitiesFetching(state),
  isMainOverviewContentFetching: getMainOverviewContentIsFetching(state),
  topTagsList: getTagsList(state),
});

const mapDispatchToProps = {
  fetchIdentity,
  fetchAlertsTotals,
  fetchMyDataEntitiesList,
  fetchMyUpstreamDataEntitiesList,
  fetchMyDownstreamDataEntitiesList,
  fetchPopularDataEntitiesList,
  fetchTagsList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Overview));
