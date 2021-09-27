import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    formField: {},
    form: {
      '& > *': {
        marginTop: theme.spacing(1.5),
      },
    },
    existingOwner: {
      '& $existingOwnerLabel': {
        marginRight: theme.spacing(0.5),
      },
    },
    existingOwnerLabel: {},
  });

export type StylesType = WithStyles<typeof styles>;
