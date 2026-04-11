import React from 'react';
import { type DataEntityDetails } from 'generated-sources';
import { DataEntityTypeNameEnum } from 'generated-sources';
import OverviewEntityRelationship from './OverviewRelationshipType/OverviewEntityRelationship';
import OverviewGraphRelationship from './OverviewRelationshipType/OverviewGraphRelationship';

interface OverviewRelationshipStatsProps {
  dataEntityDetails: DataEntityDetails;
}

const OverviewRelationshipStats: React.FC<OverviewRelationshipStatsProps> = ({
  dataEntityDetails,
}) => {
  switch (dataEntityDetails.type.name) {
    case DataEntityTypeNameEnum.ENTITY_RELATIONSHIP:
      return <OverviewEntityRelationship dataEntityDetails={dataEntityDetails} />;
    case DataEntityTypeNameEnum.GRAPH_RELATIONSHIP:
      return <OverviewGraphRelationship dataEntityDetails={dataEntityDetails} />;
    default:
      return null;
  }
};

export default OverviewRelationshipStats;
