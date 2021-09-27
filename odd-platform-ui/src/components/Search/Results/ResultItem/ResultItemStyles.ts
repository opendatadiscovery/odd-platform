import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import { colWidthStyles } from 'components/Search/Results/ResultsStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.divider,
      padding: theme.spacing(1.25, 0),
      textDecoration: 'none',
      cursor: 'pointer',
      alignItems: 'center',
      '&:hover': {
        backgroundColor: theme.palette.backgrounds.primary,
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
