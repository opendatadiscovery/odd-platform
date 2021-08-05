import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { DataQualityTestRunStatusEnum } from 'generated-sources';

export const TestReportTypeColors = {
  success: { backgroundColor: '#D1FADF', borderColor: '#A8F0A8' },
  failed: { backgroundColor: '#FFCCCC', borderColor: '#FF9999' },
  broken: { backgroundColor: '#FFEECC', borderColor: '#FFDD99' },
  skipped: { backgroundColor: '#CCE6FF', borderColor: '#99CCFF' },
  aborted: { backgroundColor: '#baacf7', borderColor: '#8066FF' },
  unknown: { backgroundColor: '#EBECF0', borderColor: '#C1C7D0' },
};

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'inline-flex',
      alignItems: 'center',
    },
    count: {
      fontSize: theme.typography.body1.fontSize,
      lineHeight: theme.typography.body1.lineHeight,
      fontWeight: theme.typography.fontWeightMedium,
    },
    countSmall: {},
    filledContainer: {
      fontSize: theme.typography.body2.fontSize,
      lineHeight: theme.typography.body2.lineHeight,
      borderRadius: '12px',
      borderWidth: '1px',
      borderStyle: 'solid',
      padding: theme.spacing(0.25, 1),
      marginLeft: theme.spacing(0.5),
      [`&.${DataQualityTestRunStatusEnum.SUCCESS}`]: {
        backgroundColor: TestReportTypeColors.success.backgroundColor,
        borderColor: TestReportTypeColors.success.borderColor,
      },
      [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
        backgroundColor: TestReportTypeColors.failed.backgroundColor,
        borderColor: TestReportTypeColors.failed.borderColor,
      },
      [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
        backgroundColor: TestReportTypeColors.broken.backgroundColor,
        borderColor: TestReportTypeColors.broken.borderColor,
      },
      [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
        backgroundColor: TestReportTypeColors.skipped.backgroundColor,
        borderColor: TestReportTypeColors.skipped.borderColor,
      },
      [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
        backgroundColor: TestReportTypeColors.aborted.backgroundColor,
        borderColor: TestReportTypeColors.aborted.borderColor,
      },
      [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
        backgroundColor: TestReportTypeColors.unknown.backgroundColor,
        borderColor: TestReportTypeColors.unknown.borderColor,
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
