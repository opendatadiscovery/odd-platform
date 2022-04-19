import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import {
  getTermDetails,
  getTermDetailsFetching,
} from 'redux/selectors/termDetails.selectors';
import Overview from './Overview';

interface RouteProps {
  termId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { termId },
    },
  }: OwnProps
) => ({
  termDetails: getTermDetails(state, termId),
  termId: parseInt(termId, 10),
  isTermDetailsFetching: getTermDetailsFetching(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
