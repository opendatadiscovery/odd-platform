import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getOwnersList, getOwnersListPage } from 'redux/selectors';
import OwnersList from './OwnersList';

const mapStateToProps = (state: RootState) => ({
  ownersList: getOwnersList(state),
  pageInfo: getOwnersListPage(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(OwnersList);
