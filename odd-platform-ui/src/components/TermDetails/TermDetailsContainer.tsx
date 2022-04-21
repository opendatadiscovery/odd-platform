import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import {
  getTermDetails,
  getTermDetailsFetchingError,
  getTermDetailsFetchingStatus,
} from 'redux/selectors/termDetails.selectors';
import { fetchTermDetails } from 'redux/thunks/termDetails.thunks';
import TermDetailsView from './TermDetails';

interface RouteProps {
  termId: string;
  viewType: string;
  reportDetailsViewType: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { termId, viewType },
    },
  }: OwnProps
) => ({
  viewType,
  termId: parseInt(termId, 10),
  termDetails: getTermDetails(state, termId),
  termFetchingStatus: getTermDetailsFetchingStatus(state),
  termFetchingError: getTermDetailsFetchingError(state),
});

const mapDispatchToProps = {
  fetchTermDetails,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TermDetailsView);
