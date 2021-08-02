import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { statusColor } from 'theme/palette';
import {
  DataQualityTestRunStatusEnum,
  DataSetTestReport,
} from 'generated-sources';

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
      marginTop: theme.spacing(2.75),
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
      [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
        color: statusColor.UNKNOWN,
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
      // Stretching bars if total width less than 50%
      const succRelation =
        (datasetQualityTestReport?.successTotal || 0) /
        (datasetQualityTestReport?.total || 1);
      const otherStatusesAdjustment =
        200 / (Math.round(1 - succRelation) + 1);
      return {
        height: '8px',
        width: '100%',
        [`&.${DataQualityTestRunStatusEnum.SUCCESS}`]: {
          backgroundColor: statusColor.SUCCESS,
          maxWidth: `${
            (succRelation * 200) / (Math.round(succRelation) + 1)
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
          backgroundColor: statusColor.FAILED,
          maxWidth: `${
            ((datasetQualityTestReport?.failedTotal || 0) /
              (datasetQualityTestReport?.total || 1)) *
            otherStatusesAdjustment
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
          backgroundColor: statusColor.BROKEN,
          maxWidth: `${
            ((datasetQualityTestReport?.brokenTotal || 0) /
              (datasetQualityTestReport?.total || 1)) *
            otherStatusesAdjustment
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
          backgroundColor: statusColor.SKIPPED,
          maxWidth: `${
            ((datasetQualityTestReport?.skippedTotal || 0) /
              (datasetQualityTestReport?.total || 1)) *
            otherStatusesAdjustment
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
          backgroundColor: statusColor.ABORTED,
          maxWidth: `${
            ((datasetQualityTestReport?.abortedTotal || 0) /
              (datasetQualityTestReport?.total || 1)) *
            otherStatusesAdjustment
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
          backgroundColor: statusColor.UNKNOWN,
          maxWidth: `${
            ((datasetQualityTestReport?.unknownTotal || 0) /
              (datasetQualityTestReport?.total || 1)) *
            otherStatusesAdjustment
          }%`,
        },
      };
    },
  });

export type StylesType = WithStyles<typeof styles>;
