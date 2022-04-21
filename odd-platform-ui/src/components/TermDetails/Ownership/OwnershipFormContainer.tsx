import { connect } from 'react-redux';
import { Ownership } from 'generated-sources';
import { RootState } from 'redux/interfaces';
import {
  createTermDetailsOwnership,
  fetchOwnersList,
  fetchRoleList,
  updateTermDetailsOwnership,
} from 'redux/thunks/owners.thunks';
import OwnershipForm from './OwnershipForm';
import { getTermDetailsOwnerUpdating } from '../../../redux/selectors/termDetails.selectors';

const mapStateToProps = (
  state: RootState,
  { termDetailsOwnership }: { termDetailsOwnership?: Ownership }
) => ({
  termDetailsOwnership,
  isUpdating: getTermDetailsOwnerUpdating(state),
});

const mapDispatchToProps = {
  createTermDetailsOwnership,
  updateTermDetailsOwnership,
  searchOwners: fetchOwnersList,
  searchRoles: fetchRoleList,
};

export default connect(mapStateToProps, mapDispatchToProps)(OwnershipForm);
