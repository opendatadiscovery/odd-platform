import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import { fetchTermGroupLinkedList } from 'redux/thunks';
import {
  getIsTermLinkedListFetching,
  getTermGroupLinkedList,
  getTermLinkedListPageInfo,
} from 'redux/selectors/termLinkedList.selectors';
import { getDataEntityClassesList } from 'redux/selectors/dataentity.selectors';
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
  isLinkedListFetching: getIsTermLinkedListFetching(state),
  entityClasses: getDataEntityClassesList(state),
});

const mapDispatchToProps = {
  fetchTermGroupLinkedList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LinkedItemsList);
