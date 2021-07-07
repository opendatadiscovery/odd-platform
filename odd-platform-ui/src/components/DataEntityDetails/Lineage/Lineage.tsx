import React from 'react';
import {
  DataEntityLineage,
  DataEntityApiGetDataEntityLineageRequest,
} from 'generated-sources';
import { DataEntityLineageById } from 'redux/interfaces/dataentityLineage';
import AppGraph from 'components/shared/AppGraph/AppGraph';
import { StylesType } from './LineageStyles';
import AppGraphContainer from '../../shared/AppGraph/AppGraphContainer';

interface LineageProps extends StylesType {
  isLoaded: boolean;
  dataEntityId: number;
  lineage: DataEntityLineageById;
  fetchDataEntityLineage: (
    params: DataEntityApiGetDataEntityLineageRequest
  ) => Promise<DataEntityLineage>;
}

const Lineage: React.FC<LineageProps> = ({ classes, dataEntityId }) => (
  <div className={classes.container}>
    <AppGraphContainer dataEntityId={dataEntityId} />
  </div>
);

export default Lineage;
