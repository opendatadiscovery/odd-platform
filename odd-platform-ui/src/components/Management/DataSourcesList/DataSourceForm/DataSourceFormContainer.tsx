import {
  registerDataSource,
  updateDataSource,
} from 'redux/thunks/datasources.thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import { getIsDatasourceCreating } from 'redux/selectors/datasources.selectors';
import DataSourceForm from 'components/Management/DataSourcesList/DataSourceForm/DataSourceForm';

const mapStateToProps = (state: RootState) => ({
  isLoading: getIsDatasourceCreating(state),
});

const mapDispatchToProps = {
  registerDataSource,
  updateDataSource,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataSourceForm);
