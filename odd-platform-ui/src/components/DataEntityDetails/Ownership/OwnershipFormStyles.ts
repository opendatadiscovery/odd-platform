import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    formField: {},
    form: {
      '& > * + *': {
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
