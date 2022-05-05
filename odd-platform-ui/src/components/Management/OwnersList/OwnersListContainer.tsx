import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getIsOwnerCreating,
  getIsOwnerDeleting,
  getIsOwnersListFetching,
  getOwnersList,
  getOwnersListPage,
} from 'redux/selectors';
import OwnersList from './OwnersList';

const mapStateToProps = (state: RootState) => ({
  ownersList: getOwnersList(state),
  isFetching: getIsOwnersListFetching(state),
  isDeleting: getIsOwnerDeleting(state),
  isCreating: getIsOwnerCreating(state),
  pageInfo: getOwnersListPage(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(OwnersList);
