import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityDetails,
  getDataEntityDetailsFetching,
  getDataEntityIsDataset,
} from 'redux/selectors/dataentity.selectors';
import { fetchDataSetQualityTestReport } from 'redux/thunks';
import { getDatasetTestReport } from 'redux/selectors';
import Overview from './Overview';

interface RouteProps {
  dataEntityId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { dataEntityId },
    },
  }: OwnProps
) => ({
  dataEntityDetails: getDataEntityDetails(state, dataEntityId),
  dataEntityId: parseInt(dataEntityId, 10),
  isDataset: getDataEntityIsDataset(state, dataEntityId),
  isDataEntityDetailsFetching: getDataEntityDetailsFetching(state),
  datasetQualityTestReport: getDatasetTestReport(state, dataEntityId),
});

const mapDispatchToProps = { fetchDataSetQualityTestReport };

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
