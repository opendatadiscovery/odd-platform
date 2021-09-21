import { createStyles, Theme, WithStyles } from '@material-ui/core';
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
        color: theme.palette.runStatus.success,
      },
      [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
        color: theme.palette.runStatus.failed,
      },
      [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
        color: theme.palette.runStatus.broken,
      },
      [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
        color: theme.palette.runStatus.skipped,
      },
      [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
        color: theme.palette.runStatus.aborted,
      },
      [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
        color: theme.palette.runStatus.unknown,
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
          backgroundColor: theme.palette.runStatus.success,
          maxWidth: `${
            (succRelation * 200) / (Math.round(succRelation) + 1)
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
          backgroundColor: theme.palette.runStatus.failed,
          maxWidth: `${
            ((datasetQualityTestReport?.failedTotal || 0) /
              (datasetQualityTestReport?.total || 1)) *
            otherStatusesAdjustment
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
          backgroundColor: theme.palette.runStatus.broken,
          maxWidth: `${
            ((datasetQualityTestReport?.brokenTotal || 0) /
              (datasetQualityTestReport?.total || 1)) *
            otherStatusesAdjustment
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
          backgroundColor: theme.palette.runStatus.skipped,
          maxWidth: `${
            ((datasetQualityTestReport?.skippedTotal || 0) /
              (datasetQualityTestReport?.total || 1)) *
            otherStatusesAdjustment
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
          backgroundColor: theme.palette.runStatus.aborted,
          maxWidth: `${
            ((datasetQualityTestReport?.abortedTotal || 0) /
              (datasetQualityTestReport?.total || 1)) *
            otherStatusesAdjustment
          }%`,
        },
        [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
          backgroundColor: theme.palette.runStatus.unknown,
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
