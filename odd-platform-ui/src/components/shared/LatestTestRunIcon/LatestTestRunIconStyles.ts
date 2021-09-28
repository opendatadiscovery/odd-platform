import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { DataQualityTestRunStatusEnum } from 'generated-sources';

export const styles = (theme: Theme) =>
  createStyles({
    latestRunIcon: {
      padding: theme.spacing(0.5),
      marginRight: theme.spacing(1),
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      [`&.${DataQualityTestRunStatusEnum.SUCCESS}`]: {
        backgroundColor: theme.palette.runStatus.success,
      },
      [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
        backgroundColor: theme.palette.runStatus.failed,
      },
      [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
        backgroundColor: theme.palette.runStatus.broken,
      },
      [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
        backgroundColor: theme.palette.runStatus.skipped,
      },
      [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
        backgroundColor: theme.palette.runStatus.aborted,
      },
      [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
        backgroundColor: theme.palette.runStatus.unknown,
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
