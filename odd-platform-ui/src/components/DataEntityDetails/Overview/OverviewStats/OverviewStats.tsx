import React from 'react';
import { withStyles } from '@material-ui/core';
import { DataEntityTypeNameEnum } from 'generated-sources';
import { DataEntityDetailsState } from 'redux/interfaces/dataentities';
import { styles, StylesType } from './OverviewStatsStyles';
import OverviewDatasetStats from './OverviewDatasetStats/OverviewDatasetStats';
import OverviewTransformerStats from './OverviewTransformerStats/OverviewTransformerStats';
import OverviewQualityTestStats from './OverviewQualityTestStats/OverviewQualityTestStats';

interface OverviewStatsProps extends StylesType {
  dataEntityDetails: DataEntityDetailsState;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({
  classes,
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
              sources={dataEntityDetails.sourceList}
              targets={dataEntityDetails.targetList}
              unknownSourcesCount={dataEntityDetails.unknownSourcesCount}
              unknownTargetsCount={dataEntityDetails.unknownTargetsCount}
            />
          );
        // case DataEntityTypeNameEnum.CONSUMER:
        //   return (<OverviewDatasetStats key={type.id} stats={dataEntityDetails.stats}/>);
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
        default:
          return null;
      }
    })}
  </>
);

export default withStyles(styles)(OverviewStats);
