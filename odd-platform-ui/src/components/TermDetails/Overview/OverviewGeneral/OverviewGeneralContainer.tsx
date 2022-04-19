import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getDataEntityOwnership } from 'redux/selectors/owners.selectors';
import { deleteTermDetailsOwnership } from 'redux/thunks/owners.thunks';
import OverviewGeneralProps from './OverviewGeneral';
import { getTermDetails } from '../../../../redux/selectors/termDetails.selectors';

const mapStateToProps = (
  state: RootState,
  { termId }: { termId: number }
) => ({
  termId,
  termDetails: getTermDetails(state, termId),
  ownership: getDataEntityOwnership(state, termId), // todo replace with getTermDetailsOwnership
});

const mapDispatchToProps = {
  deleteTermDetailsOwnership,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewGeneralProps);
