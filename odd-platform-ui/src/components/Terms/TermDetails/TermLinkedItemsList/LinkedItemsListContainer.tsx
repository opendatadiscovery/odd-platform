import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import { fetchTermGroupLinkedList } from 'redux/thunks';
import {
  getTermGroupLinkedList,
  getTermLinkedListPageInfo,
  getIsTGLinkedListFetching,
} from 'redux/selectors/termLinkedList.selectors';
import {
  getSearchEntityClass,
  getSearchTotals,
} from 'redux/selectors/dataentitySearch.selectors';
import LinkedItemsList from './LinkedItemsList';

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
  termGroupId: parseInt(termId, 10),
  termGroupLinkedList: getTermGroupLinkedList(state, termId),
  pageInfo: getTermLinkedListPageInfo(state),
  isLinkedListFetching: getIsTGLinkedListFetching(state),
  totals: getSearchTotals(state),
  searchClass: getSearchEntityClass(state),
});

const mapDispatchToProps = {
  fetchTermGroupLinkedList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LinkedItemsList);
