import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    statIcon: {
      fontSize: theme.typography.h5.fontSize,
      marginRight: theme.spacing(1),
      color: theme.palette.button?.primaryLight.normal.color,
      alignSelf: 'center',
    },
    statCount: {},
    statLabel: {
      color: theme.palette.texts.hint,
      marginLeft: theme.spacing(0.5),
    },
    statValue: {
      fontWeight: theme.typography.fontWeightBold,
    },
    typeLabel: {
      marginBottom: theme.spacing(1.25),
    },
    refs: {
      marginTop: theme.spacing(1),
    },
    unknownCount: {
      marginLeft: theme.spacing(0.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
