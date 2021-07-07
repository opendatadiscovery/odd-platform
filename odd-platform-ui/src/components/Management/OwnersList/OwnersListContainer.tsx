import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getOwnersList,
  getIsOwnerDeleting,
  getOwnersListPage,
  getIsOwnerCreating,
  getIsOwnersListFetching,
} from 'redux/selectors/owners.selectors';
import { fetchOwnersList, deleteOwner } from 'redux/thunks/owners.thunks';
import OwnersListView from './OwnersList';
import { styles } from './OwnersListStyles';

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
)(withStyles(styles)(OwnersListView));
