import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import { AlertStatus } from 'generated-sources';

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
        backgroundColor: theme.palette.alert.open.background,
        borderColor: theme.palette.alert.open.border,
        marginLeft: 0,
      },
      [`&.${AlertStatus.RESOLVED}`]: {
        backgroundColor: theme.palette.alert.resolved.background,
        borderColor: theme.palette.alert.resolved.border,
        marginLeft: 0,
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
