import React from 'react';
import { DataEntityClassNameEnum } from 'generated-sources';
import { DataEntityDetailsState } from 'redux/interfaces/dataentities';
import OverviewDataConsumerStats from 'components/DataEntityDetails/Overview/OverviewStats/OverviewDataConsumerStats/OverviewDataConsumerStats';
import OverviewEntityGroupStats from 'components/DataEntityDetails/Overview/OverviewStats/OverviewEntityGroupStats/OverviewEntityGroupStats';
import OverviewDataInputStats from 'components/DataEntityDetails/Overview/OverviewStats/OverviewDataInputStats/OverviewDataInputStats';
import OverviewDatasetStats from './OverviewDatasetStats/OverviewDatasetStats';
import OverviewTransformerStats from './OverviewTransformerStats/OverviewTransformerStats';
import OverviewQualityTestStats from './OverviewQualityTestStats/OverviewQualityTestStats';

interface OverviewStatsProps {
  dataEntityDetails: DataEntityDetailsState;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({
  dataEntityDetails,
}) => (
  <>
    {dataEntityDetails.entityClasses?.map(entityClass => {
      switch (entityClass.name) {
        case DataEntityClassNameEnum.SET:
          return (
            <OverviewDatasetStats
              key={entityClass.id}
              stats={dataEntityDetails.stats}
            />
          );
        case DataEntityClassNameEnum.TRANSFORMER:
          return (
            <OverviewTransformerStats
              key={entityClass.id}
              dataEntityName={
                dataEntityDetails?.externalName ||
                dataEntityDetails?.internalName
              }
              sources={dataEntityDetails.sourceList}
              targets={dataEntityDetails.targetList}
              unknownSourcesCount={dataEntityDetails.unknownSourcesCount}
              unknownTargetsCount={dataEntityDetails.unknownTargetsCount}
            />
          );
        case DataEntityClassNameEnum.CONSUMER:
          return (
            <OverviewDataConsumerStats
              key={entityClass.id}
              dataEntityName={
                dataEntityDetails?.externalName ||
                dataEntityDetails?.internalName
              }
              inputs={dataEntityDetails.inputList}
              unknownInputsCount={dataEntityDetails.unknownInputsCount}
            />
          );
        case DataEntityClassNameEnum.QUALITY_TEST:
          return (
            <OverviewQualityTestStats
              key={entityClass.id}
              suiteName={dataEntityDetails.suiteName}
              suiteUrl={dataEntityDetails.suiteUrl}
              datasetsList={dataEntityDetails.datasetsList}
              qualityTest={dataEntityDetails}
            />
          );
        case DataEntityClassNameEnum.INPUT:
          return (
            <OverviewDataInputStats
              key={entityClass.id}
              dataEntityName={
                dataEntityDetails?.externalName ||
                dataEntityDetails?.internalName
              }
              outputs={dataEntityDetails.outputList}
              unknownOutputsCount={dataEntityDetails.unknownOutputsCount}
            />
          );
        case DataEntityClassNameEnum.ENTITY_GROUP:
          return (
            <OverviewEntityGroupStats
              key={entityClass.id}
              dataEntityGroupName={
                dataEntityDetails.internalName ||
                dataEntityDetails.externalName
              }
              entities={dataEntityDetails.entities}
              entityGroups={dataEntityDetails.dataEntityGroups}
            />
          );
        default:
          return null;
      }
    })}
  </>
);

export default OverviewStats;
