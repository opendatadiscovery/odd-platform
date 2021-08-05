import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { AlertStatus } from 'generated-sources';

export const AlertTypeColors = {
  open: { backgroundColor: '#FFCCCC', borderColor: '#FF9999' },
  resolved: { backgroundColor: '#CCE6FF', borderColor: '#99CCFF' },
};

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'inline-flex',
      alignItems: 'center',
    },
    filledContainer: {
      fontSize: theme.typography.body2.fontSize,
      lineHeight: theme.typography.body2.lineHeight,
      borderRadius: '12px',
      borderWidth: '1px',
      borderStyle: 'solid',
      padding: theme.spacing(0.25, 1),
      marginLeft: theme.spacing(0.5),
      [`&.${AlertStatus.OPEN}`]: {
        backgroundColor: AlertTypeColors.open.backgroundColor,
        borderColor: AlertTypeColors.open.borderColor,
        marginLeft: 0,
      },
      [`&.${AlertStatus.RESOLVED}`]: {
        backgroundColor: AlertTypeColors.resolved.backgroundColor,
        borderColor: AlertTypeColors.resolved.borderColor,
        marginLeft: 0,
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
