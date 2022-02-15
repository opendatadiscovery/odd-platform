import React from 'react';
import AppGraphContainer from 'components/shared/AppGraph/AppGraphContainer';
import { Container } from './LineageStyles';

interface LineageProps {
  dataEntityId: number;
}

const Lineage: React.FC<LineageProps> = ({ dataEntityId }) => (
  <Container>
    <AppGraphContainer dataEntityId={dataEntityId} />
  </Container>
);

export default Lineage;
