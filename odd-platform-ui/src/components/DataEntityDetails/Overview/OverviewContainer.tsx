import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityDetails,
  getDataEntityDetailsFetching,
  getDataEntityIsDataset,
} from 'redux/selectors/dataentity.selectors';
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
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
