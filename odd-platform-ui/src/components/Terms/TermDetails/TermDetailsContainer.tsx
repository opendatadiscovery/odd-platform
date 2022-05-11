import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import { deleteTerm, fetchTermDetails } from 'redux/thunks';
import {
  getTermDetails,
  getTermDetailsFetchingError,
  getTermDetailsFetchingStatus,
} from 'redux/selectors/terms.selectors';
import { getTermSearchId } from 'redux/selectors/termSearch.selectors';
import TermDetails from './TermDetails';

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
  termSearchId: getTermSearchId(state),
  termId: parseInt(termId, 10),
  termDetails: getTermDetails(state, termId),
  termFetchingStatus: getTermDetailsFetchingStatus(state),
  termFetchingError: getTermDetailsFetchingError(state),
});

const mapDispatchToProps = {
  fetchTermDetails,
  deleteTerm,
};

export default connect(mapStateToProps, mapDispatchToProps)(TermDetails);
