import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { deleteDataSource } from 'redux/thunks/datasources.thunks';
import DataSourceItem from './DataSourceItem';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  deleteDataSource,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataSourceItem);
