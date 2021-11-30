import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';

import { getTagsList } from 'redux/selectors/tags.selectors';
import { createDataEntitiesSearch } from 'redux/thunks';

import TopTagsList from './TopTagsList';

const mapStateToProps = (state: RootState) => ({
  topTagsList: getTagsList(state),
});

const mapDispatchToProps = {
  createDataEntitiesSearch,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopTagsList);
