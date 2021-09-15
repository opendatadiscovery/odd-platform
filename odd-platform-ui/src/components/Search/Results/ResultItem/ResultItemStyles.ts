import { createStyles, WithStyles } from '@material-ui/core';
import { colWidthStyles } from 'components/Search/Results/ResultsStyles';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.divider,
      padding: theme.spacing(1.25, 0),
      textDecoration: 'none',
      cursor: 'pointer',
      alignItems: 'center',
      '&:hover': {
        backgroundColor: theme.palette.background.primary,
      },
    },
    itemLink: {
      color: 'initial',
      textDecoration: 'none',
      flexGrow: 1,
      overflow: 'hidden',
    },
    typesList: {
      display: 'flex',
      flexWrap: 'nowrap',
      '& > *': {
        marginLeft: theme.spacing(1),
      },
    },
    ...colWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
