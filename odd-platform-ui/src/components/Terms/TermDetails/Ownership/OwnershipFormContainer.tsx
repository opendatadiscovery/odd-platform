import { connect } from 'react-redux';
import { Ownership } from 'generated-sources';
import { RootState } from 'redux/interfaces';
import { getTermDetailsOwnerUpdating } from 'redux/selectors/terms.selectors';
import OwnershipForm from './OwnershipForm';

const mapStateToProps = (
  state: RootState,
  { termDetailsOwnership }: { termDetailsOwnership?: Ownership }
) => ({
  termDetailsOwnership,
  isUpdating: getTermDetailsOwnerUpdating(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(OwnershipForm);
