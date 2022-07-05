import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getMyDataEntitiesFetching,
  getMyDownstreamDataEntitiesFetching,
  getMyEntities,
  getMyEntitiesDownstream,
  getMyEntitiesUpstream,
  getMyUpstreamDataEntitiesFetching,
  getPopularDataEntitiesFetching,
  getPopularEntities,
} from 'redux/selectors/dataentity.selectors';
import { fetchIdentity } from 'redux/thunks/profile.thunks';
import {
  getIdentity,
  getIdentityFetched,
} from 'redux/selectors/profile.selectors';
import { getAlertTotals } from 'redux/selectors/alert.selectors';
import { getMainOverviewContentIsFetching } from 'redux/selectors/mainContentLoader.selectors';
import { fetchTagsList } from 'redux/thunks';
import { getTagsList } from 'redux/selectors/tags.selectors';
import Overview from './Overview';

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
  myDownstreamDataEntitiesFetching:
    getMyDownstreamDataEntitiesFetching(state),
  popularDataEntitiesFetching: getPopularDataEntitiesFetching(state),
  isMainOverviewContentFetching: getMainOverviewContentIsFetching(state),
  topTagsList: getTagsList(state),
});

const mapDispatchToProps = {
  fetchIdentity,
  fetchTagsList,
};

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
