import React from 'react';
import { withStyles } from '@material-ui/core';
import {
  DataEntityDetails,
  DataEntityTypeNameEnum,
} from 'generated-sources';
import { styles, StylesType } from './OverviewStatsStyles';
import OverviewDatasetStats from './OverviewDatasetStats/OverviewDatasetStats';
import OverviewTransformerStats from './OverviewTransformerStats/OverviewTransformerStats';
import OverviewQualityTestStats from './OverviewQualityTestStats/OverviewQualityTestStats';

interface OverviewStatsProps extends StylesType {
  dataEntityDetails: DataEntityDetails;
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
            />
          );
        default:
          return null;
      }
    })}
  </>
);

export default withStyles(styles)(OverviewStats);
