import { connect } from 'react-redux';
import { deleteDataSource } from 'redux/thunks/datasources.thunks';
import DataSourceItem from './DataSourceItem';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  deleteDataSource,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataSourceItem);
