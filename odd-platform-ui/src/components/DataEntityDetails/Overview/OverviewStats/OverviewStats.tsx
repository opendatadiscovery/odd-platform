import React from 'react';
import { DataEntityClassNameEnum } from 'generated-sources';
import { useAppSelector } from 'redux/lib/hooks';
import { getDataEntityDetails } from 'redux/selectors';
import { useDataEntityRouteParams } from 'routes';
import OverviewEntityGroupItems from './OverviewEntityGroupItems/OverviewEntityGroupItems';
import OverviewDataConsumerStats from './OverviewDataConsumerStats/OverviewDataConsumerStats';
import OverviewDataInputStats from './OverviewDataInputStats/OverviewDataInputStats';
import OverviewDatasetStats from './OverviewDatasetStats/OverviewDatasetStats';
import OverviewTransformerStats from './OverviewTransformerStats/OverviewTransformerStats';
import OverviewQualityTestStats from './OverviewQualityTestStats/OverviewQualityTestStats';
import OverviewRelationshipStats from './OverviewRelationshipStats/OverviewRelationshipStats';

const OverviewStats: React.FC = () => {
  const { dataEntityId } = useDataEntityRouteParams();
  const dataEntityDetails = useAppSelector(getDataEntityDetails(dataEntityId));

  const dataEntityName =
    dataEntityDetails?.externalName || dataEntityDetails?.internalName;

  return (
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
                dataEntityName={dataEntityName}
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
                dataEntityName={dataEntityName}
                inputs={dataEntityDetails.inputList}
                unknownInputsCount={dataEntityDetails.unknownInputsCount}
              />
            );
          case DataEntityClassNameEnum.QUALITY_TEST:
            return (
              <OverviewQualityTestStats
                key={entityClass.id}
                dataEntityName={dataEntityName}
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
                dataEntityName={dataEntityName}
                outputs={dataEntityDetails.outputList}
                unknownOutputsCount={dataEntityDetails.unknownOutputsCount}
              />
            );
          case DataEntityClassNameEnum.RELATIONSHIP:
            return (
              <OverviewRelationshipStats
                key={entityClass.id}
                dataEntityDetails={dataEntityDetails}
              />
            );
          case DataEntityClassNameEnum.ENTITY_GROUP:
            return <OverviewEntityGroupItems key={entityClass.id} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default OverviewStats;
