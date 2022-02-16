import { connect } from 'react-redux';
import { deleteDataSource, updateDataSource } from 'redux/thunks';
import DataSourceItemToken from 'components/Management/DataSourcesList/DataSourceItem/DataSourceItemToken/DataSourceItemToken';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  deleteDataSource,
  updateDataSource,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataSourceItemToken);
