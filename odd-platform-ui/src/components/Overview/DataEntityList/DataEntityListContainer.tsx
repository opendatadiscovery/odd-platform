import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import DataEntityList from './DataEntityList';
import { styles } from './DataEntityListStyles';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DataEntityList));
