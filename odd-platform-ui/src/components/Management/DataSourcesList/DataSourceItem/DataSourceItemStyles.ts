import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: 'calc(100% - 8px)',
      padding: theme.spacing(2, 2, 2, 2),
      margin: '0 auto',
      alignItems: 'flex-start',
      '&:hover': {
        boxShadow: theme.shadows[8],
      },
      '&:hover $actionsContainer': {
        visibility: 'visible',
        display: 'flex',
        justifyContent: 'flex-end',
      },
    },
    nameContainer: { minHeight: '40px' },
    actionsContainer: {
      visibility: 'hidden',
    },
    pullingValue: { color: 'green' },
    descriptionContainer: {
      '& > *': {
        marginBottom: theme.spacing(1),
      },
      '& > *:last-child': {
        marginBottom: theme.spacing(0),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
