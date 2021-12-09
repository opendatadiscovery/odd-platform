import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import { fetchDataEntityGroupLinkedList } from 'redux/thunks';
import {
  getDataEntityGroupLinkedList,
  getDataEntityGroupLinkedListPage,
  getIsDEGLinkedListFetching,
} from 'redux/selectors/dataentityLinkedList.selectors';
import LinkedItemsList from './LinkedItemsList';

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
  dataEntityGroupId: parseInt(dataEntityId, 10),
  dataEntityGroupLinkedList: getDataEntityGroupLinkedList(
    state,
    dataEntityId
  ),
  pageInfo: getDataEntityGroupLinkedListPage(state),
  isLinkedListFetching: getIsDEGLinkedListFetching(state),
});

const mapDispatchToProps = {
  fetchDataEntityGroupLinkedList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LinkedItemsList);
