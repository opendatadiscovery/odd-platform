import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityDetails,
  getDataEntityDetailsFetchingError,
  getDataEntityDetailsFetchingStatus,
  getDataEntityIsDataset,
  getDataEntityIsQualityTest,
} from 'redux/selectors/dataentity.selectors';
import { fetchDataEntityDetails } from 'redux/thunks/dataentities.thunks';
import { getDataEntityOpenAlertListCount } from 'redux/selectors/alert.selectors';
import { fetchDataEntityAlerts } from 'redux/thunks';
import DataEntityDetailsView from './DataEntityDetails';

interface RouteProps {
  dataEntityId: string;
  viewType: string;
  reportDetailsViewType: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { dataEntityId, viewType },
    },
  }: OwnProps
) => ({
  viewType,
  dataEntityId: parseInt(dataEntityId, 10),
  dataEntityDetails: getDataEntityDetails(state, dataEntityId),
  isDataset: getDataEntityIsDataset(state, dataEntityId),
  isQualityTest: getDataEntityIsQualityTest(state, dataEntityId),
  dataEntityFetchingStatus: getDataEntityDetailsFetchingStatus(state),
  dataEntityFetchingError: getDataEntityDetailsFetchingError(state),
  openAlertsCount: getDataEntityOpenAlertListCount(state, dataEntityId),
});

const mapDispatchToProps = {
  fetchDataEntityDetails,
  fetchDataEntityAlerts,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataEntityDetailsView);
