import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getTermSearchFacetsData,
  getTermSearchFetchError,
  getTermSearchFetchStatus,
  getTermSearchFiltersSynced,
  getTermSearchId,
  getTermSearchIsCreating,
  getTermSearchQuery,
} from 'redux/selectors/termSearch.selectors';
import {
  createTermSearch,
  getTermSearchDetails,
  updateTermSearch,
} from 'redux/thunks';
import TermSearch from 'components/Terms/TermSearch/TermSearch';

interface RouteProps {
  termSearchId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { termSearchId },
    },
  }: OwnProps
) => ({
  termSearchIdParam: termSearchId,
  termSearchId: getTermSearchId(state),
  termSearchQuery: getTermSearchQuery(state),
  termSearchFacetParams: getTermSearchFacetsData(state),
  termSearchFacetsSynced: getTermSearchFiltersSynced(state),
  termSearchFetchStatus: getTermSearchFetchStatus(state),
  termSearchError: getTermSearchFetchError(state),
  isTermSearchCreating: getTermSearchIsCreating(state),
});

const mapDispatchToProps = {
  getTermSearchDetails,
  updateTermSearch,
  createTermSearch,
};

export default connect(mapStateToProps, mapDispatchToProps)(TermSearch);
