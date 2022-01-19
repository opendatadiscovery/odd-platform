import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getIsOwnerCreating,
  getIsOwnerDeleting,
  getIsOwnersListFetching,
  getOwnersList,
  getOwnersListPage,
} from 'redux/selectors/owners.selectors';
import { deleteOwner, fetchOwnersList } from 'redux/thunks/owners.thunks';
import OwnersListView from './OwnersList';

const mapStateToProps = (state: RootState) => ({
  ownersList: getOwnersList(state),
  isFetching: getIsOwnersListFetching(state),
  isDeleting: getIsOwnerDeleting(state),
  isCreating: getIsOwnerCreating(state),
  pageInfo: getOwnersListPage(state),
});

const mapDispatchToProps = {
  fetchOwnersList,
  deleteOwner,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OwnersListView);
