import { createStyles, Theme, WithStyles } from '@material-ui/core';
import {
  DataQualityTestRunStatusEnum,
  DataSetTestReport,
} from 'generated-sources';

const statusColor = {
  SUCCESS: '#1FAD1F',
  FAILED: '#F2330D',
  BROKEN: '#FFAA00',
  SKIPPED: '#0080FF',
  ABORTED: '#0080FF', // Temp
  OTHER: '#A8B0BD',
};

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: '100%',
      display: 'flex',
      justifyContent: 'stretch',
      alignItems: 'stretch',
      justifySelf: 'stretch',
      flexGrow: 1,
    },
    title: {
      display: 'block',
    },
    totalScore: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    countContainer: {
      '& + $countContainer': {
        marginTop: theme.spacing(0.25),
      },
    },
    countValue: {
      marginRight: theme.spacing(0.5),
    },
    countLabel: {
      [`&.${DataQualityTestRunStatusEnum.SUCCESS}`]: {
        color: statusColor.SUCCESS,
      },
      [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
        color: statusColor.FAILED,
      },
      [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
        color: statusColor.BROKEN,
      },
      [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
        color: statusColor.SKIPPED,
      },
      [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
        color: statusColor.ABORTED,
      },
      [`&.${DataQualityTestRunStatusEnum.OTHER}`]: {
        color: statusColor.OTHER,
      },
    },
    barsContainer: {
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
    },
    bar: ({
      datasetQualityTestReport,
    }: {
      datasetQualityTestReport?: DataSetTestReport;
    }) => {
      const totalPct = (datasetQualityTestReport?.total || 1) / 100;
      return {
        height: '8px',
        width: '100%',
        [`&.${DataQualityTestRunStatusEnum.SUCCESS}`]: {
          backgroundColor: statusColor.SUCCESS,
          maxWidth: `${
            (datasetQualityTestReport?.successTotal || 0) / totalPct
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
          backgroundColor: statusColor.FAILED,
          maxWidth: `${
            (datasetQualityTestReport?.failedTotal || 0) / totalPct
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
          backgroundColor: statusColor.BROKEN,
          maxWidth: `${
            (datasetQualityTestReport?.brokenTotal || 0) / totalPct
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
          backgroundColor: statusColor.SKIPPED,
          // maxWidth: `${(datasetQualityTestReport?.skippedTotal || 0) / totalPct}%`
        },
        [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
          backgroundColor: statusColor.ABORTED,
          maxWidth: `${
            (datasetQualityTestReport?.abortedTotal || 0) / totalPct
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.OTHER}`]: {
          backgroundColor: statusColor.OTHER,
          maxWidth: `${
            (datasetQualityTestReport?.unknownTotal || 0) / totalPct
          }%`,
        },
      };
    },
  });

export type StylesType = WithStyles<typeof styles>;
