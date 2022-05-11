import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getTermDetailsOwnership } from 'redux/selectors/owners.selectors';
import { deleteTermDetailsOwnership } from 'redux/thunks/owners.thunks';
import { getTermDetails } from 'redux/selectors/terms.selectors';
import OverviewGeneral from './OverviewGeneral';

const mapStateToProps = (
  state: RootState,
  { termId }: { termId: number }
) => ({
  termId,
  termDetails: getTermDetails(state, termId),
  ownership: getTermDetailsOwnership(state, termId),
});

const mapDispatchToProps = {
  deleteTermDetailsOwnership,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewGeneral);
