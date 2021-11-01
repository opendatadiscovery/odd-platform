import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: { marginTop: 0 },
    caption: { marginBottom: theme.spacing(3) },
    sectionContainer: {
      padding: 0,
      '& + $sectionContainer': { marginTop: theme.spacing(2) },
      '& > *': {
        padding: theme.spacing(2, 2),
      },
      '& > * + *': {
        borderTop: '1px solid',
        borderTopColor: theme.palette.divider,
      },
    },
    sectionCaption: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
