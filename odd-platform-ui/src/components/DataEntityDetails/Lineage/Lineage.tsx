import React from 'react';
import AppGraphContainer from 'components/shared/AppGraph/AppGraphContainer';
import { DataEntityLineageById } from 'redux/interfaces/dataentityLineage';
import { Container } from './LineageStyles';

interface LineageProps {
  isLoaded: boolean;
  dataEntityId: number;
  lineage: DataEntityLineageById;
}

const Lineage: React.FC<LineageProps> = ({ dataEntityId }) => (
  <Container container sx={{ mt: 2 }}>
    <AppGraphContainer dataEntityId={dataEntityId} />
  </Container>
);

export default Lineage;
