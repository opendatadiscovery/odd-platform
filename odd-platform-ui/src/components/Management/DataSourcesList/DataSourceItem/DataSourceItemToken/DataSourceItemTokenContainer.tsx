import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { deleteDataSource, updateDataSource } from 'redux/thunks';
import DataSourceItemToken from 'components/Management/DataSourcesList/DataSourceItem/DataSourceItemToken/DataSourceItemToken';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  deleteDataSource,
  updateDataSource,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataSourceItemToken);
