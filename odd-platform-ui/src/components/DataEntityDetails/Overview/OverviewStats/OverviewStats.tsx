import React from 'react';
import { DataEntityTypeNameEnum } from 'generated-sources';
import { DataEntityDetailsState } from 'redux/interfaces/dataentities';
import OverviewDataConsumerStats from 'components/DataEntityDetails/Overview/OverviewStats/OverviewDataConsumerStats/OverviewDataConsumerStats';
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
    {dataEntityDetails.types.map(type => {
      switch (type.name) {
        case DataEntityTypeNameEnum.SET:
          return (
            <OverviewDatasetStats
              key={type.id}
              stats={dataEntityDetails.stats}
            />
          );
        case DataEntityTypeNameEnum.TRANSFORMER:
          return (
            <OverviewTransformerStats
              key={type.id}
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
        case DataEntityTypeNameEnum.CONSUMER:
          return (
            <OverviewDataConsumerStats
              key={type.id}
              dataEntityName={
                dataEntityDetails?.externalName ||
                dataEntityDetails?.internalName
              }
              inputs={dataEntityDetails.inputList}
              unknownInputsCount={dataEntityDetails.unknownInputsCount}
            />
          );
        case DataEntityTypeNameEnum.QUALITY_TEST:
          return (
            <OverviewQualityTestStats
              key={type.id}
              suiteName={dataEntityDetails.suiteName}
              suiteUrl={dataEntityDetails.suiteUrl}
              datasetsList={dataEntityDetails.datasetsList}
              qualityTest={dataEntityDetails}
            />
          );
        case DataEntityTypeNameEnum.INPUT:
          return (
            <OverviewDataInputStats
              key={type.id}
              dataEntityName={
                dataEntityDetails?.externalName ||
                dataEntityDetails?.internalName
              }
              outputs={dataEntityDetails.outputList}
              unknownOutputsCount={dataEntityDetails.unknownOutputsCount}
            />
          );
        default:
          return null;
      }
    })}
  </>
);

export default OverviewStats;
