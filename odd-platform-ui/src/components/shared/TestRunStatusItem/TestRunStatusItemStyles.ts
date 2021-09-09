import { createStyles, WithStyles } from '@material-ui/core';
import { DataQualityTestRunStatusEnum } from 'generated-sources';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
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
      [`&.${DataQualityTestRunStatusEnum.SUCCESS}`]: {
        backgroundColor: theme.palette.reportStatus?.success.background,
        borderColor: theme.palette.reportStatus?.success.border,
      },
      [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
        backgroundColor: theme.palette.reportStatus?.failed.background,
        borderColor: theme.palette.reportStatus?.failed.border,
      },
      [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
        backgroundColor: theme.palette.reportStatus?.broken.background,
        borderColor: theme.palette.reportStatus?.broken.border,
      },
      [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
        backgroundColor: theme.palette.reportStatus?.skipped.background,
        borderColor: theme.palette.reportStatus?.skipped.border,
      },
      [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
        backgroundColor: theme.palette.reportStatus?.aborted.background,
        borderColor: theme.palette.reportStatus?.aborted.border,
      },
      [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
        backgroundColor: theme.palette.reportStatus?.unknown.background,
        borderColor: theme.palette.reportStatus?.unknown.border,
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
