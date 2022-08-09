import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getSearchFacetsData,
  getSearchFiltersSynced,
  getSearchId,
  getSearchMyObjects,
  getSearchQuery,
} from 'redux/selectors/dataentitySearch.selectors';
import Search from './Search';

interface RouteProps {
  searchId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { searchId },
    },
  }: OwnProps
) => ({
  searchIdParam: searchId,
  searchId: getSearchId(state),
  searchQuery: getSearchQuery(state),
  searchMyObjects: getSearchMyObjects(state),
  searchFacetParams: getSearchFacetsData(state),
  searchFacetsSynced: getSearchFiltersSynced(state),
  // searchFetchStatus: getSearchFetchStatus(state),
  // searchError: getSearchFetchError(state),
  // isSearchCreating: getSearchIsCreating(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
