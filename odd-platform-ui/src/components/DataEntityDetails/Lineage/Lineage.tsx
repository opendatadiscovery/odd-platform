import React from 'react';
import {
  DataEntityLineage,
  DataEntityApiGetDataEntityDownstreamLineageRequest,
} from 'generated-sources';
import AppGraphContainer from 'components/shared/AppGraph/AppGraphContainer';
import { DataEntityLineageById } from 'redux/interfaces/dataentityLineage';
import { StylesType } from './LineageStyles';

interface LineageProps extends StylesType {
  isLoaded: boolean;
  dataEntityId: number;
  lineage: DataEntityLineageById;
  fetchDataEntityLineage: (
    params: DataEntityApiGetDataEntityDownstreamLineageRequest
  ) => Promise<DataEntityLineage>;
}

const Lineage: React.FC<LineageProps> = ({ classes, dataEntityId }) => (
  <div className={classes.container}>
    <AppGraphContainer dataEntityId={dataEntityId} />
  </div>
);

export default Lineage;
