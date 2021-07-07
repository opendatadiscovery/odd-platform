import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import { getDataEntityDetails } from 'redux/selectors/dataentity.selectors';
import { fetchDataEntityDetails } from 'redux/thunks/dataentities.thunks';
import DataEntityDetails from './DataEntityDetails';
import { styles } from './DataEntityDetailsStyles';

interface RouteProps {
  dataEntityId: string;
  viewType: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { dataEntityId, viewType },
    },
  }: OwnProps
) => ({
  viewType,
  dataEntityId: parseInt(dataEntityId, 10),
  dataEntityDetails: getDataEntityDetails(state, dataEntityId),
});

const mapDispatchToProps = {
  fetchDataEntityDetails,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DataEntityDetails));
