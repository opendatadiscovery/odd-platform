import { updateDataEntityTags } from 'redux/thunks/dataentities.thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getDataEntityTags,
  getDataEntityTagsUpdating,
} from 'redux/selectors/dataentity.selectors';
import { fetchTagsList } from 'redux/thunks';
import TermsAddForm from 'components/DataEntityDetails/Overview/OverviewTerms/TermsAddForm/TermsAddForm';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  dataEntityTags: getDataEntityTags(state, dataEntityId),
  isLoading: getDataEntityTagsUpdating(state),
});

const mapDispatchToProps = {
  updateDataEntityTags,
  searchTags: fetchTagsList,
};

export default connect(mapStateToProps, mapDispatchToProps)(TermsAddForm);
