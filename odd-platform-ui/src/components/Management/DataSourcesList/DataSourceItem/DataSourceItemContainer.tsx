import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { deleteDataSource, updateToken } from 'redux/thunks';
import DataSourceItem from './DataSourceItem';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  deleteDataSource,
  updateToken,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataSourceItem);
