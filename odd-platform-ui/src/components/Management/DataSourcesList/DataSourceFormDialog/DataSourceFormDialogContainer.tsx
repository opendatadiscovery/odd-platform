import { withStyles } from '@material-ui/core';
import {
  registerDataSource,
  updateDataSource,
} from 'redux/thunks/datasources.thunks';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces/state';
import { getIsDatasourceCreating } from 'redux/selectors/datasources.selectors';
import DataSourceFormDialog from './DataSourceFormDialog';
import { styles } from './DataSourceFormDialogStyles';

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
)(withStyles(styles)(DataSourceFormDialog));
