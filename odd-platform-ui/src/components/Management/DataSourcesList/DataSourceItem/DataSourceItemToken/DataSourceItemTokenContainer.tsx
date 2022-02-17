import { connect } from 'react-redux';
import { deleteDataSource, regenerateDataSourceToken } from 'redux/thunks';
import DataSourceItemToken from 'components/Management/DataSourcesList/DataSourceItem/DataSourceItemToken/DataSourceItemToken';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  deleteDataSource,
  regenerateDataSourceToken,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataSourceItemToken);
