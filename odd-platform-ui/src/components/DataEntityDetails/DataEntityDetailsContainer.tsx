import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityDetails,
  getDataEntityDetailsFetchingStatus,
  getDataEntityIsDataset,
  getDataEntityIsQualityTest,
  getDataEntityIsTransformerJob,
} from 'redux/selectors/dataentity.selectors';
import { getDataEntityOpenAlertListCount } from 'redux/selectors/alert.selectors';
import {
  fetchDataEntityAlerts,
  fetchDataSetQualityTestReport,
} from 'redux/thunks';
import { getDatasetTestReport } from 'redux/selectors';
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
  isTransformerJob: getDataEntityIsTransformerJob(state, dataEntityId),
  dataEntityFetchingStatus: getDataEntityDetailsFetchingStatus(state),
  openAlertsCount: getDataEntityOpenAlertListCount(state, dataEntityId),
  datasetQualityTestReport: getDatasetTestReport(state, dataEntityId),
});

const mapDispatchToProps = {
  fetchDataEntityAlerts,
  fetchDataSetQualityTestReport,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataEntityDetailsView);
