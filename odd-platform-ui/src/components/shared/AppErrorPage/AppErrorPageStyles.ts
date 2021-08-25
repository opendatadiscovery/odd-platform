import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { pxToRem } from 'theme/typography';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(10),
    },
    errorCode: {
      fontSize: pxToRem(72),
      lineHeight: pxToRem(84),
      marginRight: theme.spacing(4),
    }
  });

export type StylesType = WithStyles<typeof styles>;
