import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    infoContainer: { marginTop: theme.spacing(3) },
  });

export type StylesType = WithStyles<typeof styles>;
