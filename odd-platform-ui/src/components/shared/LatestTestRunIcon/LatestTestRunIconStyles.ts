import { createStyles, WithStyles } from '@material-ui/core';
import { DataQualityTestRunStatusEnum } from 'generated-sources';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    latestRunIcon: {
      padding: theme.spacing(0.5),
      marginRight: theme.spacing(1),
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      [`&.${DataQualityTestRunStatusEnum.SUCCESS}`]: {
        backgroundColor: theme.palette.runStatus?.SUCCESS,
      },
      [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
        backgroundColor: theme.palette.runStatus?.FAILED,
      },
      [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
        backgroundColor: theme.palette.runStatus?.BROKEN,
      },
      [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
        backgroundColor: theme.palette.runStatus?.SKIPPED,
      },
      [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
        backgroundColor: theme.palette.runStatus?.ABORTED,
      },
      [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
        backgroundColor: theme.palette.runStatus?.UNKNOWN,
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
