import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import { fetchDataEntityLineage } from 'redux/thunks/dataentityLineage.thunks';
import LineageStructure from './Lineage';
import { styles } from './LineageStyles';

interface RouteProps {
  dataEntityId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { dataEntityId },
    },
  }: OwnProps
) => ({
  isLoaded: true,
  dataEntityId: parseInt(dataEntityId, 10),
});

const mapDispatchToProps = {
  fetchDataEntityLineage,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LineageStructure));
