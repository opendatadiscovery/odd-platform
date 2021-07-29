import { Theme, createStyles, WithStyles } from '@material-ui/core';
import { statusColor } from 'theme/palette';
import { DataQualityTestRunStatusEnum } from 'generated-sources';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      flexWrap: 'nowrap',
      padding: theme.spacing(0.75, 1),
      alignItems: 'center',
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: '#EBECF0',
      },
    },
    latestRunIcon: {
      padding: theme.spacing(0.5),
      marginRight: theme.spacing(1),
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      [`&.${DataQualityTestRunStatusEnum.SUCCESS}`]: {
        backgroundColor: statusColor.SUCCESS,
      },
      [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
        backgroundColor: statusColor.FAILED,
      },
      [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
        backgroundColor: statusColor.BROKEN,
      },
      [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
        backgroundColor: statusColor.SKIPPED,
      },
      [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
        backgroundColor: statusColor.ABORTED,
      },
      [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
        backgroundColor: statusColor.UNKNOWN,
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
